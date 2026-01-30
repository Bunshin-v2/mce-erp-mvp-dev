import React, { createContext, useContext, useState, useEffect } from 'react';

// Definitions for the Style Command System
export type DensityMode = 'executive' | 'operational';
export type SurfaceReliability = 'flat' | 'elevated' | 'bordered';
export type SignalIntensity = 'standard' | 'high-contrast';
export type PanelHierarchy = 'balanced' | 'focused';
export type SidebarWeight = 'light' | 'normal' | 'bold';
export type SidebarSize = 'compact' | 'normal' | 'large';

interface StyleConfig {
    density: DensityMode;
    surface: SurfaceReliability;
    signal: SignalIntensity;
    hierarchy: PanelHierarchy;

    // Granular Controls
    sidebarOptimized: boolean; // True = Collapsed/Icon-focus, False = Full
    sidebarWeight: SidebarWeight; // Typography weight for sidebar labels
    sidebarSize: SidebarSize; // Font size for sidebar labels
    kpiEmphasis: 'value' | 'label'; // Value = Numeric dominant, Label = Context dominant
    verticalRhythm: 'tight' | 'relaxed';
}

const defaultStyle: StyleConfig = {
    density: 'executive',
    surface: 'bordered',
    signal: 'standard',
    hierarchy: 'balanced',
    sidebarOptimized: false,
    sidebarWeight: 'normal', // More readable default
    sidebarSize: 'normal', // Slightly larger by default
    kpiEmphasis: 'label', // User requested "Label-First"
    verticalRhythm: 'relaxed',
};

interface StyleContextType {
    config: StyleConfig;
    updateConfig: (updates: Partial<StyleConfig>) => void;
    resetToBaseline: () => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<StyleConfig>(() => {
        // Load from storage if available (only in browser)
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mce-style-config');
            return saved ? JSON.parse(saved) : defaultStyle;
        }
        return defaultStyle;
    });

    // Persist changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('mce-style-config', JSON.stringify(config));
        }
    }, [config]);

    // Apply CSS Variables based on config
    useEffect(() => {
        const root = document.documentElement;

        // 1. Spacing / Density
        if (config.density === 'operational') {
            root.style.setProperty('--space-unit', '0.75rem');
            root.style.setProperty('--font-scale', '0.9');
        } else {
            root.style.setProperty('--space-unit', '1rem');
            root.style.setProperty('--font-scale', '1');
        }

        // 2. Vertical Rhythm
        root.style.setProperty('--rhythm-y', config.verticalRhythm === 'tight' ? '0.5rem' : '1.5rem');

        // 3. Signal Intensity
        if (config.signal === 'high-contrast') {
            root.style.setProperty('--color-critical', '#ff0000'); // Pure red for max signal
            root.style.setProperty('--surface-base', '#000000'); // Deepest black
            root.style.setProperty('--surface-layer', '#0a0a0a');
        } else {
            root.style.setProperty('--color-critical', '#e11d48'); // Rose-600 standard
        }

        // 4. Sidebar Typography Weight
        if (config.sidebarWeight === 'light') {
            root.style.setProperty('--sidebar-weight', '300'); // Light
            root.style.setProperty('--sidebar-opacity', '0.6');
        } else if (config.sidebarWeight === 'normal') {
            root.style.setProperty('--sidebar-weight', '400'); // Normal
            root.style.setProperty('--sidebar-opacity', '0.7');
        } else {
            root.style.setProperty('--sidebar-weight', '500'); // Bold
            root.style.setProperty('--sidebar-opacity', '0.8');
        }

        // 5. Sidebar Size
        if (config.sidebarSize === 'compact') {
            root.style.setProperty('--sidebar-text-size', '0.75rem'); // 12px - compact
            root.style.setProperty('--sidebar-header-size', '0.65rem'); // 10px - header
        } else if (config.sidebarSize === 'normal') {
            root.style.setProperty('--sidebar-text-size', '0.8125rem'); // 13px - standard
            root.style.setProperty('--sidebar-header-size', '0.7rem'); // 11px - header
        } else {
            root.style.setProperty('--sidebar-text-size', '0.875rem'); // 14px - large
            root.style.setProperty('--sidebar-header-size', '0.75rem'); // 12px - header
        }

    }, [config]);

    const updateConfig = (updates: Partial<StyleConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const resetToBaseline = () => {
        setConfig(defaultStyle);
    };

    return (
        <StyleContext.Provider value={{ config, updateConfig, resetToBaseline }}>
            {children}
        </StyleContext.Provider>
    );
};

export const useStyleSystem = () => {
    const context = useContext(StyleContext);
    if (!context) {
        throw new Error('useStyleSystem must be used within a StyleProvider');
    }
    return context;
};

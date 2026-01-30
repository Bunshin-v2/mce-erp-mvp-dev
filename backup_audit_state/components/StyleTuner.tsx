import React, { useState } from 'react';
import { Settings, X, Sidebar, Layout, Zap, Monitor, Sliders, ChevronRight } from 'lucide-react';
import { useStyleSystem, DensityMode, SurfaceReliability, SignalIntensity, PanelHierarchy } from '../lib/StyleSystem';

export const StyleTuner: React.FC = () => {
   const [isOpen, setIsOpen] = useState(false);
   const { config, updateConfig, resetToBaseline } = useStyleSystem();

   const Section = ({ label, children }: { label: string, children: React.ReactNode }) => (
      <div className="space-y-3">
         <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center">
            <ChevronRight size={10} className="mr-1 text-[var(--color-critical)]" />
            {label}
         </h4>
         <div className="grid grid-cols-2 gap-2">
            {children}
         </div>
      </div>
   );

   const ToggleBtn = ({ active, onClick, label, icon: Icon }: any) => (
      <button
         onClick={onClick}
         className={`p-3 rounded border text-[10px] font-bold uppercase tracking-widest text-left flex items-center space-x-3 transition-all ${active
            ? 'bg-[var(--surface-apex)] border-[var(--surface-border)] text-black shadow-sm'
            : 'bg-[var(--surface-layer)] border-[var(--surface-border)] text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}
      >
         {Icon && <Icon size={12} className={active ? 'text-[var(--color-critical)]' : 'opacity-50'} />}
         <span>{label}</span>
      </button>
   );

   return (
      <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end">
         {/* Trigger */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 rounded-full shadow-2xl border transition-all duration-300 hover:scale-105 ${isOpen ? 'bg-[var(--surface-apex)] border-zinc-300 text-black' : 'bg-[var(--surface-base)] border-[var(--surface-border)] text-zinc-500 hover:text-white'}`}
            title="System Command"
         >
            {isOpen ? <X size={20} /> : <Sliders size={20} />}
         </button>

         {/* Panel */}
         {isOpen && (
            <div className="absolute bottom-16 right-0 bg-[var(--surface-base)] border border-[var(--surface-border)] p-6 rounded-lg shadow-2xl w-80 animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-xl">
               <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <div>
                     <h3 className="text-[10px] font-black text-white flex items-center uppercase tracking-[0.3em] font-brand">
                        Interface Command
                     </h3>
                     <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider mt-1 font-mono">v2.4.0 • Authorized</p>
                  </div>
                  <button onClick={resetToBaseline} className="text-[9px] text-zinc-500 hover:text-[var(--color-critical)] underline decoration-dotted transition-colors font-mono">
                     RESET
                  </button>
               </div>

               <div className="space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">

                  {/* 1. Sidebar Logic */}
                  <Section label="Nav Physics">
                     <ToggleBtn
                        active={!config.sidebarOptimized}
                        onClick={() => updateConfig({ sidebarOptimized: false })}
                        label="Expanded"
                        icon={Sidebar}
                     />
                     <ToggleBtn
                        active={config.sidebarOptimized}
                        onClick={() => updateConfig({ sidebarOptimized: true })}
                        label="Collapsed"
                        icon={Sidebar}
                     />
                  </Section>

                  {/* 2. Density Control */}
                  <Section label="Information Density">
                     <ToggleBtn
                        active={config.density === 'executive'}
                        onClick={() => updateConfig({ density: 'executive' })}
                        label="Executive"
                        icon={Layout}
                     />
                     <ToggleBtn
                        active={config.density === 'operational'}
                        onClick={() => updateConfig({ density: 'operational' })}
                        label="Ops-Cluster"
                        icon={Layout}
                     />
                  </Section>

                  {/* 3. Surface Physics */}
                  <Section label="Surface Physics">
                     <ToggleBtn
                        active={config.surface === 'flat'}
                        onClick={() => updateConfig({ surface: 'flat' })}
                        label="Minimal Flat"
                        icon={Monitor}
                     />
                     <ToggleBtn
                        active={config.surface === 'bordered'}
                        onClick={() => updateConfig({ surface: 'bordered' })}
                        label="Structural"
                        icon={Monitor}
                     />
                  </Section>

                  {/* 4. Signal Intensity */}
                  <Section label="Signal Matrix">
                     <ToggleBtn
                        active={config.signal === 'standard'}
                        onClick={() => updateConfig({ signal: 'standard' })}
                        label="Standard"
                        icon={Zap}
                     />
                     <ToggleBtn
                        active={config.signal === 'high-contrast'}
                        onClick={() => updateConfig({ signal: 'high-contrast' })}
                        label="High Contrast"
                        icon={Zap}
                     />
                  </Section>

                  {/* 5. KPI Emphasis */}
                  <Section label="Metric Emphasis">
                     <ToggleBtn
                        active={config.kpiEmphasis === 'value'}
                        onClick={() => updateConfig({ kpiEmphasis: 'value' })}
                        label="Value-First"
                        icon={Zap}
                     />
                     <ToggleBtn
                        active={config.kpiEmphasis === 'label'}
                        onClick={() => updateConfig({ kpiEmphasis: 'label' })}
                        label="Label-First"
                        icon={Zap}
                     />
                  </Section>

                  {/* 6. Sidebar Typography Weight */}
                  <Section label="Nav Weight">
                     <ToggleBtn
                        active={config.sidebarWeight === 'light'}
                        onClick={() => updateConfig({ sidebarWeight: 'light' })}
                        label="Light"
                        icon={Sidebar}
                     />
                     <ToggleBtn
                        active={config.sidebarWeight === 'normal'}
                        onClick={() => updateConfig({ sidebarWeight: 'normal' })}
                        label="Normal"
                        icon={Sidebar}
                     />
                     <ToggleBtn
                        active={config.sidebarWeight === 'bold'}
                        onClick={() => updateConfig({ sidebarWeight: 'bold' })}
                        label="Bold"
                        icon={Sidebar}
                     />
                  </Section>

                  {/* 7. Sidebar Size */}
                  <Section label="Nav Size">
                     <ToggleBtn
                        active={config.sidebarSize === 'compact'}
                        onClick={() => updateConfig({ sidebarSize: 'compact' })}
                        label="Compact"
                        icon={Sidebar}
                     />
                     <ToggleBtn
                        active={config.sidebarSize === 'normal'}
                        onClick={() => updateConfig({ sidebarSize: 'normal' })}
                        label="Normal"
                        icon={Sidebar}
                     />
                     <ToggleBtn
                        active={config.sidebarSize === 'large'}
                        onClick={() => updateConfig({ sidebarSize: 'large' })}
                        label="Large"
                        icon={Sidebar}
                     />
                  </Section>

               </div>
            </div>
         )}
      </div>
   );
};

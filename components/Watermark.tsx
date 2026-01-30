import React from 'react';

interface WatermarkProps {
  text?: string;
  opacity?: number;
}

/**
 * Enterprise Letterhead Watermark Component
 * Creates "MORGAN" diagonal watermark - single centered text, similar to official company letterheads
 */
export const Watermark: React.FC<WatermarkProps> = ({
  text = 'MORGAN',
  opacity = 0.04,  // Subtle for darker theme
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none">
      {/* Dark matte background gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 120% 100% at 50% 0%, rgba(255,69,25,0.01) 0%, rgba(0,0,0,0) 50%)`,
          pointerEvents: 'none'
        }}
      />

      {/* Morgan watermark text - matte dark edition */}
      <div
        style={{
          fontSize: '400px',
          fontWeight: '900',
          color: 'rgba(255, 69, 25, 0.5)', // Subdued Morgan Red for dark theme
          opacity: opacity,
          transform: 'rotate(-45deg)',
          letterSpacing: '40px',
          fontFamily: 'Inter, sans-serif',
          whiteSpace: 'nowrap',
          mixBlendMode: 'screen',  // Subtle blend for matte
          filter: 'blur(14px)',  // Softer blur for matte effect
          textShadow: '0 0 80px rgba(255, 69, 25, 0.15)',  // Very subtle glow
        }}
      >
        {text}
      </div>
    </div>
  );
};

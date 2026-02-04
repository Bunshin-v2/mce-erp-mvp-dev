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
  opacity = 0.008,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none">
      <div
        style={{
          fontSize: '400px',
          fontWeight: '900',
          color: '#c21719', // Restored Morgan Red
          opacity: opacity,
          transform: 'rotate(-45deg)',
          letterSpacing: '40px',
          fontFamily: 'Inter, sans-serif',
          whiteSpace: 'nowrap',
          mixBlendMode: 'overlay', // High-end blending
          filter: 'blur(24px)', // Dispersed phantom edges
        }}
      >
        {text}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  maxRotation?: number;
  scale?: number;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  maxRotation,
  scale = 1.02,
  onClick
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isTilting, setIsTilting] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;

    setTilt({
      x: x * maxTilt * 2,
      y: y * -maxTilt * 2
    });
  };

  const handleMouseEnter = () => {
    setIsTilting(true);
  };

  const handleMouseLeave = () => {
    setIsTilting(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={`${className} transition-all duration-200`}
      style={{
        perspective: '1200px'
      } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={
        isTilting
          ? {
              rotateX: tilt.x,
              rotateY: tilt.y,
              scale: scale
            }
          : {
              rotateX: 0,
              rotateY: 0,
              scale: 1
            }
      }
      transition={{ type: 'spring', stiffness: 400, damping: 60 }}
    >
      {children}
    </motion.div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number | string;
  format?: 'number' | 'currency' | 'percentage' | 'decimal';
  duration?: number;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  format = 'number',
  duration = 1.2,
  decimals = 0
}) => {
  // Parse numeric value
  const numValue = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.-]/g, ''))
    : value;

  // Spring animation for smooth counting
  const springValue = useSpring(numValue, {
    damping: 60,
    mass: 1,
    stiffness: 100
  });

  // Transform spring value to formatted string
  const displayValue = useTransform(springValue, (value) => {
    const isNaN = Number.isNaN(value);
    if (isNaN) return '0';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'AED',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);

      case 'percentage':
        return `${Math.round(value)}%`;

      case 'decimal':
        return value.toFixed(decimals);

      case 'number':
      default:
        return Math.round(value).toLocaleString();
    }
  });

  return (
    <motion.span
      className="tabular-nums inline-block font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue}
    </motion.span>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashUpdateProps {
  children: React.ReactNode;
  trigger?: any;
  duration?: number;
}

export const FlashUpdate: React.FC<FlashUpdateProps> = ({
  children,
  trigger,
  duration = 800
}) => {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    setIsFlashing(true);
    const timer = setTimeout(() => setIsFlashing(false), duration);
    return () => clearTimeout(timer);
  }, [trigger, duration]);

  return (
    <motion.div
      animate={isFlashing ? { backgroundColor: 'rgba(59, 130, 246, 0.15)' } : { backgroundColor: 'transparent' }}
      transition={{ duration: duration / 1000 }}
    >
      {children}
    </motion.div>
  );
};

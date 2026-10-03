'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`glass ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
}
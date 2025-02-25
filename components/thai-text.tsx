import React from 'react';
import { cn } from '@/lib/utils';

interface ThaiTextProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * A component that applies the Thai font to its content.
 * Use this component to wrap Thai text to ensure it uses the IBM Plex Sans Thai font.
 */
export function ThaiText({ 
  children, 
  className, 
  as: Component = 'span' 
}: ThaiTextProps) {
  return (
    <Component className={cn('font-thai thai-text', className)}>
      {children}
    </Component>
  );
} 
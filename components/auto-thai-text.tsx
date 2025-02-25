import React from 'react';
import { ThaiText } from './thai-text';
import { containsThai } from '@/lib/utils';

interface AutoThaiTextProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * A component that automatically applies the Thai font when the text contains Thai characters
 */
export function AutoThaiText({ 
  children, 
  className, 
  as = 'span'
}: AutoThaiTextProps) {
  // Only check if the content contains Thai characters
  const shouldUseThaiFontByContent = 
    typeof children === 'string' && 
    containsThai(children);
  
  // Use Thai font if the content contains Thai characters
  if (shouldUseThaiFontByContent) {
    return (
      <ThaiText className={className} as={as}>
        {children}
      </ThaiText>
    );
  }
  
  // Otherwise, render normally
  return React.createElement(as, { className }, children);
} 
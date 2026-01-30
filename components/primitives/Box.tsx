import React from 'react';
import { cn } from '@/lib/utils';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
}

/**
 * Box Primitive
 * Basic layout building block. Defaults to 'div'.
 * Used to avoid raw HTML elements and ensure consistent standard utility usage.
 */
export const Box = React.forwardRef<HTMLElement, BoxProps>(
    ({ as: Component = 'div', className, children, ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(className)}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Box.displayName = 'Box';

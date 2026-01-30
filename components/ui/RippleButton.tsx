
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './Button';

export interface RippleButtonProps extends ButtonProps {
    rippleColor?: string;
    duration?: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
    className,
    onClick,
    rippleColor = 'rgba(255, 255, 255, 0.3)',
    duration = 600,
    children,
    ...props
}) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const newRipple = { x, y, id: Date.now() };
        setRipples((prev) => [...prev, newRipple]);

        if (onClick) {
            onClick(e);
        }
    };

    useEffect(() => {
        if (ripples.length > 0) {
            const timeout = setTimeout(() => {
                setRipples((prev) => prev.slice(1));
            }, duration);

            return () => clearTimeout(timeout);
        }
    }, [ripples, duration]);

    return (
        <Button
            className={cn("relative overflow-hidden", className)}
            onClick={createRipple}
            {...props}
        >
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none animate-ripple"
                    style={{
                        top: ripple.y,
                        left: ripple.x,
                        width: Math.max(100, (props.style?.width as number) || 100) * 2, // Ensure it covers
                        height: Math.max(100, (props.style?.height as number) || 100) * 2,
                        backgroundColor: rippleColor,
                        transform: 'scale(0)',
                        animationDuration: `${duration}ms`,
                    }}
                />
            ))}
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </Button>
    );
};

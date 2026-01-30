import { useState, useEffect } from 'react';

/**
 * A hook that returns a class name to trigger a flash animation when the value changes.
 * @param value The value to monitor for changes.
 * @param duration Duration of the flash effect in ms (default 1000ms).
 * @returns string Class name to apply (e.g., 'motion-flash') or empty string.
 */
export function useFlashAnimation(value: string | number, duration: number = 1000) {
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
        // Don't flash on initial render if logic requires previous value,
        // but here we just flash on any update that isn't the mount (effectively).
        // Actually, we can just trigger it.

        setIsFlashing(true);
        const timer = setTimeout(() => setIsFlashing(false), duration);
        return () => clearTimeout(timer);
    }, [value, duration]);

    return isFlashing ? 'motion-flash' : '';
}

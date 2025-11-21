'use client';

import { useEffect, useRef } from 'react';
import type { GSAPAnimation } from '@/lib/animations/types';

/**
 * Custom hook for GSAP animations
 * @param animationFn - Function that creates and returns a GSAP animation
 * @param deps - Dependencies array for the effect
 * @returns Ref to attach to the element
 */
export function useGsapAnimation<T extends HTMLElement>(
    animationFn: (element: T) => GSAPAnimation | null,
    deps: any[] = []
) {
    const elementRef = useRef<T>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const animation = animationFn(elementRef.current);

        return () => {
            if (animation) {
                animation.kill();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return elementRef;
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation<T extends HTMLElement>(
    animationFn: (element: T) => void,
    deps: any[] = []
) {
    const elementRef = useRef<T>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        animationFn(elementRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return elementRef;
}

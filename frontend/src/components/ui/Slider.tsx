/**
 * Slider - 双向滑块组件
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
    min?: number;
    max?: number;
    step?: number;
    value?: [number, number];
    defaultValue?: [number, number];
    onChange?: (value: [number, number]) => void;
    className?: string;
    disabled?: boolean;
}

export function Slider({
    min = 0,
    max = 10,
    step = 0.5,
    value,
    defaultValue = [min, max],
    onChange,
    className,
    disabled = false,
}: SliderProps) {
    const [internalValue, setInternalValue] = useState<[number, number]>(
        value || defaultValue
    );
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const currentValue = value || internalValue;
    const [minValue, maxValue] = currentValue;

    useEffect(() => {
        if (value) {
            setInternalValue(value);
        }
    }, [value]);

    const getPercentage = (val: number) => {
        return ((val - min) / (max - min)) * 100;
    };

    const getValueFromPosition = (clientX: number) => {
        if (!trackRef.current) return min;

        const rect = trackRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const rawValue = min + percentage * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    };

    const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(type);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || disabled) return;

        const newValue = getValueFromPosition(e.clientX);

        let newRange: [number, number];
        if (isDragging === 'min') {
            newRange = [Math.min(newValue, maxValue), maxValue];
        } else {
            newRange = [minValue, Math.max(newValue, minValue)];
        }

        setInternalValue(newRange);
        onChange?.(newRange);
    };

    const handleMouseUp = () => {
        setIsDragging(null);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
        return undefined;
    }, [isDragging, minValue, maxValue]);

    const minPercentage = getPercentage(minValue);
    const maxPercentage = getPercentage(maxValue);

    return (
        <div className={cn('w-full', className)}>
            {/* 数值显示 */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {minValue.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">评分范围</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {maxValue.toFixed(1)}
                </span>
            </div>

            {/* 滑块轨道 */}
            <div className="relative h-2 mb-2">
                {/* 背景轨道 */}
                <div
                    ref={trackRef}
                    className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full"
                />

                {/* 激活区域 */}
                <div
                    className="absolute h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-200"
                    style={{
                        left: `${minPercentage}%`,
                        right: `${100 - maxPercentage}%`,
                    }}
                />

                {/* 最小值滑块 */}
                <div
                    className={cn(
                        'absolute top-1/2 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-full cursor-pointer shadow-md transition-all duration-200',
                        isDragging === 'min' && 'scale-110 shadow-lg',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    style={{
                        left: `${minPercentage}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={handleMouseDown('min')}
                />

                {/* 最大值滑块 */}
                <div
                    className={cn(
                        'absolute top-1/2 w-5 h-5 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-full cursor-pointer shadow-md transition-all duration-200',
                        isDragging === 'max' && 'scale-110 shadow-lg',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    style={{
                        left: `${maxPercentage}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={handleMouseDown('max')}
                />
            </div>

            {/* 刻度标记 */}
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
}

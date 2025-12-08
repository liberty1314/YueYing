/**
 * TextType - 打字机效果组件
 * 
 * 实现类似 @react-bits/text-type 的打字机动画效果
 */

'use client';

import { useState, useEffect } from 'react';

interface TextTypeProps {
    text: string;
    speed?: number; // 每个字符的延迟时间（毫秒）
    showCursor?: boolean;
    cursorChar?: string;
    onComplete?: () => void;
    className?: string;
}

export function TextType({
    text,
    speed = 30,
    showCursor = true,
    cursorChar = '|',
    onComplete,
    className = '',
}: TextTypeProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (currentIndex === text.length && !isComplete) {
            setIsComplete(true);
            onComplete?.();
        }
        return undefined;
    }, [currentIndex, text, speed, isComplete, onComplete]);

    // 重置当文本改变时
    useEffect(() => {
        setDisplayedText('');
        setCurrentIndex(0);
        setIsComplete(false);
    }, [text]);

    return (
        <span className={className}>
            {displayedText}
            {showCursor && !isComplete && (
                <span className="inline-block w-0.5 h-5 ml-0.5 bg-blue-500 dark:bg-blue-400 animate-pulse">
                    {cursorChar}
                </span>
            )}
        </span>
    );
}

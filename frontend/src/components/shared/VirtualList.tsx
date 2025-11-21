import { useEffect, useRef, useState, ReactNode } from 'react';
import { Box } from '@mui/material';

interface VirtualListProps<T> {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: T, index: number) => ReactNode;
    overscan?: number;
}

/**
 * 虚拟滚动列表组件
 * 用于优化长列表性能
 */
export default function VirtualList<T>({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    overscan = 3,
}: VirtualListProps<T>) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startIndex * itemHeight;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
        <Box
            ref={containerRef}
            onScroll={handleScroll}
            sx={{
                height: containerHeight,
                overflow: 'auto',
                position: 'relative',
            }}
        >
            <Box sx={{ height: totalHeight, position: 'relative' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: offsetY,
                        left: 0,
                        right: 0,
                    }}
                >
                    {visibleItems.map((item, index) =>
                        renderItem(item, startIndex + index)
                    )}
                </Box>
            </Box>
        </Box>
    );
}

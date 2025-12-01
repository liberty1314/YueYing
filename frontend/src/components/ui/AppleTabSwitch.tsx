/**
 * AppleTabSwitch - 优雅的Apple风格标签切换器
 * 
 * 特点：
 * - 流畅的滑动指示器动画
 * - 支持2-7个标签
 * - 自适应宽度
 * - 支持自定义标签内容（文字、数字、图标等）
 */

'use client';

import { Box, styled } from '@mui/material';

interface TabOption {
    id: string | number;
    label: React.ReactNode;
    count?: number;
}

interface AppleTabSwitchProps {
    options: TabOption[];
    value: string | number;
    onChange: (value: string | number) => void;
    size?: 'small' | 'medium' | 'large';
}

const TabContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '2px',
    backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.06)',
    borderRadius: '12px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
}));

const TabInput = styled('input')({
    width: 0,
    height: 0,
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
});

const TabLabel = styled('label')<{ size?: 'small' | 'medium' | 'large' }>(({ theme, size = 'medium' }) => {
    const sizeConfig = {
        small: {
            minWidth: '70px',
            height: '32px',
            fontSize: '0.8rem',
            padding: '0 12px',
        },
        medium: {
            minWidth: '90px',
            height: '36px',
            fontSize: '0.875rem',
            padding: '0 16px',
        },
        large: {
            minWidth: '110px',
            height: '40px',
            fontSize: '0.95rem',
            padding: '0 20px',
        },
    };

    const config = sizeConfig[size];

    return {
        minWidth: config.minWidth,
        height: config.height,
        position: 'relative',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        border: 0,
        fontSize: config.fontSize,
        fontWeight: 600,
        padding: config.padding,
        color: theme.palette.text.secondary,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'color 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        whiteSpace: 'nowrap',

        '&:hover': {
            color: theme.palette.text.primary,
        },

        '& .count': {
            fontSize: '0.75em',
            opacity: 0.7,
        },
    };
});

const Indicator = styled(Box, {
    shouldForwardProp: (prop) => !['activeIndex', 'tabWidth', 'size'].includes(prop as string),
})<{
    activeIndex: number;
    tabWidth: number;
    size?: 'small' | 'medium' | 'large';
}>(({ theme, activeIndex, tabWidth, size = 'medium' }) => {
    const sizeConfig = {
        small: { height: '28px' },
        medium: { height: '32px' },
        large: { height: '36px' },
    };

    const config = sizeConfig[size];

    return {
        content: '""',
        width: `${tabWidth}px`,
        height: config.height,
        background: theme.palette.background.paper,
        position: 'absolute',
        top: '2px',
        left: '2px',
        transform: `translateX(${activeIndex * tabWidth}px)`,
        zIndex: 9,
        border: theme.palette.mode === 'dark'
            ? '0.5px solid rgba(255, 255, 255, 0.1)'
            : '0.5px solid rgba(0, 0, 0, 0.04)',
        boxShadow: theme.palette.mode === 'dark'
            ? '0px 3px 12px rgba(0, 0, 0, 0.4), 0px 3px 1px rgba(0, 0, 0, 0.2)'
            : '0px 3px 12px rgba(0, 0, 0, 0.12), 0px 3px 1px rgba(0, 0, 0, 0.04)',
        borderRadius: '10px',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform',
    };
});

export default function AppleTabSwitch({
    options,
    value,
    onChange,
    size = 'medium',
}: AppleTabSwitchProps) {
    const activeIndex = options.findIndex(opt => opt.id === value);

    // 计算每个标签的宽度（基于容器宽度平均分配）
    const sizeConfig = {
        small: 70,
        medium: 90,
        large: 110,
    };
    const tabWidth = sizeConfig[size];

    return (
        <TabContainer>
            {options.map((option) => (
                <Box key={option.id} sx={{ position: 'relative' }}>
                    <TabInput
                        type="radio"
                        name="apple-tab"
                        id={`tab-${option.id}`}
                        checked={value === option.id}
                        onChange={() => onChange(option.id)}
                    />
                    <TabLabel
                        htmlFor={`tab-${option.id}`}
                        size={size}
                        sx={{
                            color: value === option.id ? 'text.primary' : 'text.secondary',
                        }}
                    >
                        {option.label}
                        {option.count !== undefined && (
                            <span className="count">({option.count})</span>
                        )}
                    </TabLabel>
                </Box>
            ))}
            <Indicator
                activeIndex={activeIndex}
                tabWidth={tabWidth}
                size={size}
            />
        </TabContainer>
    );
}

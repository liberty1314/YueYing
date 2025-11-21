'use client';

import { Component, ReactNode } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { AppleCard } from '@/components/ui';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: any;
}

/**
 * 错误边界组件
 * 
 * 捕获子组件树中的JavaScript错误，记录错误并显示降级UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ errorInfo });

        // 可以在这里发送错误到日志服务
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        bgcolor: 'background.default',
                    }}
                >
                    <AppleCard
                        variant="elevated"
                        sx={{
                            maxWidth: 500,
                            width: '100%',
                            p: 4,
                        }}
                    >
                        <Stack spacing={3} alignItems="center" textAlign="center">
                            <ErrorOutlineIcon
                                sx={{
                                    fontSize: 64,
                                    color: 'error.main',
                                }}
                            />

                            <Stack spacing={1}>
                                <Typography variant="h5" fontWeight={600}>
                                    出错了
                                </Typography>
                                <Typography color="text.secondary">
                                    {this.state.error?.message || '发生了未知错误'}
                                </Typography>
                            </Stack>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <Box
                                    sx={{
                                        width: '100%',
                                        p: 2,
                                        bgcolor: 'grey.100',
                                        borderRadius: 2,
                                        textAlign: 'left',
                                        overflow: 'auto',
                                        maxHeight: 200,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        component="pre"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {this.state.error.stack}
                                    </Typography>
                                </Box>
                            )}

                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    onClick={this.handleReset}
                                    sx={{ textTransform: 'none' }}
                                >
                                    重试
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={this.handleReload}
                                    sx={{ textTransform: 'none' }}
                                >
                                    刷新页面
                                </Button>
                            </Stack>
                        </Stack>
                    </AppleCard>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

import { Dialog, styled } from '@mui/material';

/**
 * Apple 风格对话框组件
 * 
 * 基于 Material-UI Dialog 构建的 Apple 风格对话框。
 * 特点：大圆角、柔和阴影、磨砂玻璃背景、流畅动画。
 */
export const AppleDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
    },

    '& .MuiDialog-paper': {
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        padding: 0,
        maxWidth: 560,
        width: '100%',
        margin: 16,
        background: theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.98)'
            : 'rgba(28, 28, 30, 0.98)',
        backdropFilter: 'blur(20px)',
    },
}));

export default AppleDialog;

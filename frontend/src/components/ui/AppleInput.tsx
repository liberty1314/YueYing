import { TextField, TextFieldProps, styled } from '@mui/material';

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 12,
        backgroundColor: theme.palette.mode === 'light' ? '#F5F5F7' : '#1C1C1E',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '16px',
        minHeight: '48px',

        '& fieldset': {
            borderColor: 'transparent',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },

        '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? '#EBEBED' : '#2C2C2E',

            '& fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '1px',
            },
        },

        '&.Mui-focused': {
            backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : '#1C1C1E',
            boxShadow: `0 0 0 4px ${theme.palette.mode === 'light' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.2)'}`,

            '& fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
            },
        },

        '&.Mui-error fieldset': {
            borderColor: theme.palette.error.main,
        },
    },

    '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
        fontSize: '14px',
        fontWeight: 500,

        '&.Mui-focused': {
            color: theme.palette.primary.main,
        },
    },

    '& .MuiFormHelperText-root': {
        marginLeft: 4,
        marginTop: 6,
        fontSize: '13px',
    },

    '& .MuiSelect-select': {
        paddingTop: '14px',
        paddingBottom: '14px',
    },

    '& .MuiInputBase-input': {
        padding: '14px 16px',
    },

    '& .MuiInputBase-multiline': {
        padding: 0,
    },
}));

/**
 * Apple 风格输入框组件的属性接口
 * 
 * @interface AppleInputProps
 * @extends {Omit<TextFieldProps, 'variant'>}
 */
export interface AppleInputProps extends Omit<TextFieldProps, 'variant'> {
    // Additional custom props can be added here
}

/**
 * Apple 风格输入框组件
 * 
 * 基于 Material-UI TextField 构建的 Apple 风格输入框。
 * 特点：圆角设计、柔和的背景色、流畅的聚焦动画。
 * 
 * @component
 * @example
 * ```tsx
 * // 基础输入框
 * <AppleInput
 *   label="用户名"
 *   placeholder="请输入用户名"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 * 
 * // 带错误提示的输入框
 * <AppleInput
 *   label="邮箱"
 *   error
 *   helperText="邮箱格式不正确"
 * />
 * 
 * // 多行文本输入框
 * <AppleInput
 *   label="备注"
 *   multiline
 *   rows={4}
 *   fullWidth
 * />
 * ```
 * 
 * @param {AppleInputProps} props - 组件属性
 * @returns {JSX.Element} Apple 风格输入框组件
 */
export function AppleInput(props: AppleInputProps) {
    return <StyledTextField variant="outlined" {...props} />;
}

export default AppleInput;

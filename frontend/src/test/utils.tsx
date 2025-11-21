import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 创建测试主题
const testTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#007AFF',
        },
        secondary: {
            main: '#5856D6',
        },
    },
});

// 自定义渲染函数，包含必要的 Provider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    theme?: typeof testTheme;
}

export function renderWithProviders(
    ui: ReactElement,
    options?: CustomRenderOptions
) {
    const { theme = testTheme, ...renderOptions } = options || {};

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// 导出所有 testing-library 的工具
export * from '@testing-library/react';
export { renderWithProviders as render };

'use client';

import { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper, Stack, Divider } from '@mui/material';
import { AppleButton, AppleCard, AppleInput, Loading } from '@/components/ui';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`component-tabpanel-${index}`}
            aria-labelledby={`component-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ComponentsShowcase() {
    const [tabValue, setTabValue] = useState(0);
    const [inputValue, setInputValue] = useState('');

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                    设计系统组件库
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    基于 Apple 风格设计的 UI 组件集合
                </Typography>
            </Box>

            <Paper sx={{ borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="component tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab label="按钮 (Button)" />
                    <Tab label="卡片 (Card)" />
                    <Tab label="输入框 (Input)" />
                    <Tab label="加载 (Loading)" />
                </Tabs>

                {/* Button Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Stack spacing={4} sx={{ px: 3 }}>
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight={600}>
                                AppleButton 组件
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Apple 风格的按钮组件，支持多种变体和状态。
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                变体 (Variants)
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                <AppleButton variant="primary">Primary Button</AppleButton>
                                <AppleButton variant="secondary">Secondary Button</AppleButton>
                                <AppleButton variant="ghost">Ghost Button</AppleButton>
                                <AppleButton variant="text">Text Button</AppleButton>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                尺寸 (Sizes)
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                                <AppleButton size="small">Small</AppleButton>
                                <AppleButton size="medium">Medium</AppleButton>
                                <AppleButton size="large">Large</AppleButton>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                状态 (States)
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                <AppleButton>Normal</AppleButton>
                                <AppleButton disabled>Disabled</AppleButton>
                                <AppleButton fullWidth>Full Width</AppleButton>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                代码示例
                            </Typography>
                            <Paper
                                sx={{
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    overflow: 'auto',
                                }}
                            >
                                <pre>{`import { AppleButton } from '@/components/ui';

// Primary button
<AppleButton variant="primary">
  Click Me
</AppleButton>

// Ghost button with full width
<AppleButton variant="ghost" fullWidth>
  Full Width Button
</AppleButton>

// Disabled button
<AppleButton disabled>
  Disabled
</AppleButton>`}</pre>
                            </Paper>
                        </Box>
                    </Stack>
                </TabPanel>

                {/* Card Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Stack spacing={4} sx={{ px: 3 }}>
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight={600}>
                                AppleCard 组件
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Apple 风格的卡片组件，支持多种视觉效果。
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                变体 (Variants)
                            </Typography>
                            <Stack spacing={2}>
                                <AppleCard variant="elevated" sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Elevated Card
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        带有阴影效果的卡片，适合展示重要内容。
                                    </Typography>
                                </AppleCard>

                                <AppleCard variant="outlined" sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Outlined Card
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        带有边框的卡片，适合列表展示。
                                    </Typography>
                                </AppleCard>

                                <AppleCard variant="glass" sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Glass Card
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        毛玻璃效果的卡片，适合叠加在背景图片上。
                                    </Typography>
                                </AppleCard>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                悬停效果 (Hover)
                            </Typography>
                            <Stack spacing={2}>
                                <AppleCard variant="elevated" hover sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Hover Card
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        鼠标悬停时会有提升动画效果。
                                    </Typography>
                                </AppleCard>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                代码示例
                            </Typography>
                            <Paper
                                sx={{
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    overflow: 'auto',
                                }}
                            >
                                <pre>{`import { AppleCard } from '@/components/ui';

// Elevated card with hover effect
<AppleCard variant="elevated" hover sx={{ p: 3 }}>
  <Typography variant="h6">Card Title</Typography>
  <Typography variant="body2">Card content...</Typography>
</AppleCard>

// Glass effect card
<AppleCard variant="glass" sx={{ p: 3 }}>
  Content with glass effect
</AppleCard>`}</pre>
                            </Paper>
                        </Box>
                    </Stack>
                </TabPanel>

                {/* Input Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Stack spacing={4} sx={{ px: 3 }}>
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight={600}>
                                AppleInput 组件
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Apple 风格的输入框组件，基于 Material-UI TextField。
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                基础用法
                            </Typography>
                            <Stack spacing={2}>
                                <AppleInput
                                    label="用户名"
                                    placeholder="请输入用户名"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <AppleInput
                                    label="邮箱"
                                    type="email"
                                    placeholder="example@email.com"
                                    helperText="我们不会分享您的邮箱地址"
                                />
                                <AppleInput
                                    label="密码"
                                    type="password"
                                    placeholder="请输入密码"
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                状态 (States)
                            </Typography>
                            <Stack spacing={2}>
                                <AppleInput label="正常状态" placeholder="输入内容..." />
                                <AppleInput label="禁用状态" placeholder="禁用" disabled />
                                <AppleInput
                                    label="错误状态"
                                    placeholder="输入内容..."
                                    error
                                    helperText="这是一个错误提示"
                                />
                                <AppleInput
                                    label="必填字段"
                                    placeholder="输入内容..."
                                    required
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                多行文本
                            </Typography>
                            <AppleInput
                                label="备注"
                                placeholder="请输入备注..."
                                multiline
                                rows={4}
                                fullWidth
                            />
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                代码示例
                            </Typography>
                            <Paper
                                sx={{
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    overflow: 'auto',
                                }}
                            >
                                <pre>{`import { AppleInput } from '@/components/ui';

// Basic input
<AppleInput
  label="用户名"
  placeholder="请输入用户名"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// Input with error
<AppleInput
  label="邮箱"
  error
  helperText="邮箱格式不正确"
/>

// Multiline input
<AppleInput
  label="备注"
  multiline
  rows={4}
  fullWidth
/>`}</pre>
                            </Paper>
                        </Box>
                    </Stack>
                </TabPanel>

                {/* Loading Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Stack spacing={4} sx={{ px: 3 }}>
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight={600}>
                                Loading 组件
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                加载指示器组件，用于显示加载状态。
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                基础用法
                            </Typography>
                            <Stack spacing={3} alignItems="flex-start">
                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        默认加载器
                                    </Typography>
                                    <Loading />
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        带消息的加载器
                                    </Typography>
                                    <Loading message="加载中..." />
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        自定义大小
                                    </Typography>
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Loading size={20} />
                                        <Loading size={40} />
                                        <Loading size={60} />
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                全屏加载
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                使用 fullScreen 属性可以创建全屏遮罩加载效果。
                            </Typography>
                            <AppleButton
                                onClick={() => {
                                    // 这里只是演示，实际使用时需要状态管理
                                    alert('全屏加载效果需要在实际应用中使用状态管理');
                                }}
                            >
                                查看全屏加载示例
                            </AppleButton>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" gutterBottom>
                                代码示例
                            </Typography>
                            <Paper
                                sx={{
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    overflow: 'auto',
                                }}
                            >
                                <pre>{`import { Loading } from '@/components/ui';

// Basic loading
<Loading />

// Loading with message
<Loading message="加载中..." />

// Custom size
<Loading size={60} />

// Full screen loading
<Loading fullScreen message="正在处理..." />`}</pre>
                            </Paper>
                        </Box>
                    </Stack>
                </TabPanel>
            </Paper>
        </Container>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ChatSidebar, MessageBubble, InputArea } from '@/components/features/assistant';
import { assistantApi } from '@/lib/api/assistant';

// 本地类型
interface Message {
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    streaming?: boolean;
}

interface Conversation {
    id: number;
    title: string;
    message_count: number;
    last_message?: string;
    created_at: string;
    updated_at: string;
}

export default function AssistantPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 加载对话列表
    useEffect(() => {
        loadConversations();
    }, []);

    // 加载当前对话的消息
    useEffect(() => {
        if (currentConversationId) {
            loadMessages(currentConversationId);
        } else {
            setMessages([]);
        }
    }, [currentConversationId]);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const data = await assistantApi.getConversations();
            setConversations(data.map(conv => ({
                ...conv,
                updated_at: conv.updated_at || conv.created_at || new Date().toISOString(),
                last_message: ''
            })));
        } catch (error) {
            console.error('加载对话列表失败:', error);
        }
    };

    const loadMessages = async (conversationId: number) => {
        try {
            setIsLoading(true);
            const data = await assistantApi.getConversation(conversationId);
            setMessages(data.messages.map(msg => ({
                ...msg,
                created_at: msg.created_at || new Date().toISOString()
            })));
        } catch (error) {
            console.error('加载消息失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || isSending) return;

        const userMessage = message.trim();
        setIsSending(true);

        // 立即显示用户消息
        const tempUserMessage: Message = {
            role: 'user',
            content: userMessage,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMessage]);

        // 添加占位的AI消息，用于流式输出
        const tempAIMessage: Message = {
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
            streaming: true,
        };
        setMessages((prev) => [...prev, tempAIMessage]);
        const streamingIndex = messages.length + 1;
        setStreamingMessageIndex(streamingIndex);

        try {
            const response = await assistantApi.chat({
                message: userMessage,
                conversation_id: currentConversationId || undefined,
            });

            // 更新对话 ID
            if (!currentConversationId) {
                setCurrentConversationId(response.conversation_id);
                await loadConversations();
            }

            // 更新AI回复 - 保持 streaming 状态，让打字机效果完成
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: response.message,
                    created_at: new Date().toISOString(),
                    streaming: true, // 保持 streaming 状态
                };
                return newMessages;
            });
            // 注意：不在这里清除 streamingMessageIndex，让打字机效果完成后再清除
        } catch (error) {
            console.error('发送消息失败:', error);
            // 移除临时消息
            setMessages((prev) => prev.slice(0, -2));
            setStreamingMessageIndex(null);
        } finally {
            setIsSending(false);
            // 不在这里清除 streamingMessageIndex
        }
    };

    // 处理打字机效果完成
    const handleTypingComplete = (messageIndex: number) => {
        // 清除 streaming 状态
        setMessages((prev) => {
            const newMessages = [...prev];
            if (newMessages[messageIndex]) {
                newMessages[messageIndex] = {
                    ...newMessages[messageIndex],
                    streaming: false,
                };
            }
            return newMessages;
        });
        // 清除 streamingMessageIndex
        setStreamingMessageIndex(null);
    };

    const handleNewConversation = () => {
        setCurrentConversationId(null);
        setMessages([]);
    };

    const handleDeleteConversation = async (id: number) => {
        try {
            // 调用删除API
            await assistantApi.deleteConversation(id);
            // 重新加载对话列表
            await loadConversations();
            // 如果删除的是当前对话，清空消息
            if (currentConversationId === id) {
                handleNewConversation();
            }
        } catch (error) {
            console.error('删除对话失败:', error);
        }
    };

    return (
        <ProtectedRoute>
            {/* 全屏容器 - 锁定视口高度，减去 Navbar 高度 */}
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-black">
                {/* 移动端遮罩层 */}
                {isMobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* 侧边栏 - ChatSidebar */}
                <div className={`
                    fixed md:relative inset-y-0 left-0 z-50 md:z-auto
                    transform transition-transform duration-300 ease-in-out
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <ChatSidebar
                        conversations={conversations}
                        currentConversationId={currentConversationId}
                        onSelectConversation={(id) => {
                            setCurrentConversationId(id);
                            setIsMobileSidebarOpen(false);
                        }}
                        onNewConversation={() => {
                            handleNewConversation();
                            setIsMobileSidebarOpen(false);
                        }}
                        onDeleteConversation={handleDeleteConversation}
                    />
                </div>

                {/* 主聊天区域 - Gemini 风格布局（黄框+红框） */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
                    {/* 移动端顶部栏 */}
                    <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold">AI 助手</h1>
                    </div>

                    {/* 消息滚动区域 - 独立滚动（黄框） */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-gray-950 scroll-smooth"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgb(203 213 225) transparent'
                        }}
                    >
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                {/* 快捷建议卡片 - Grid 布局 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
                                    {[
                                        {
                                            icon: (
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M19.82 2H4.18C2.97602 2 2 2.97602 2 4.18V19.82C2 21.024 2.97602 22 4.18 22H19.82C21.024 22 22 21.024 22 19.82V4.18C22 2.97602 21.024 2 19.82 2Z" fill="url(#movie_gradient)" fillOpacity="0.2" />
                                                    <path d="M7 2L7 22M17 2V22M2 12H22M2 7H7M2 17H7M17 7H22M17 17H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <defs>
                                                        <linearGradient id="movie_gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#F43F5E" />
                                                            <stop offset="1" stopColor="#EC4899" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            ),
                                            title: '推荐电影',
                                            desc: '根据观看历史推荐',
                                            color: 'from-rose-500 to-pink-500'
                                        },
                                        {
                                            icon: (
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="3" y="3" width="7" height="7" rx="1" fill="url(#stats_gradient)" fillOpacity="0.2" />
                                                    <rect x="3" y="14" width="7" height="7" rx="1" fill="url(#stats_gradient)" fillOpacity="0.2" />
                                                    <rect x="14" y="3" width="7" height="7" rx="1" fill="url(#stats_gradient)" fillOpacity="0.2" />
                                                    <rect x="14" y="14" width="7" height="7" rx="1" fill="url(#stats_gradient)" fillOpacity="0.2" />
                                                    <path d="M3 17L10 10M14 17L21 10M3 7L10 14M14 7L21 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <defs>
                                                        <linearGradient id="stats_gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#3B82F6" />
                                                            <stop offset="1" stopColor="#06B6D4" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            ),
                                            title: '数据统计',
                                            desc: '分析观影趋势',
                                            color: 'from-blue-500 to-cyan-500'
                                        },
                                        {
                                            icon: (
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" fill="url(#tag_gradient)" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <circle cx="7" cy="7" r="1.5" fill="currentColor" />
                                                    <defs>
                                                        <linearGradient id="tag_gradient" x1="2" y1="2" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                                            <stop stopColor="#8B5CF6" />
                                                            <stop offset="1" stopColor="#A855F7" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            ),
                                            title: '标签分析',
                                            desc: '总结内容类型',
                                            color: 'from-violet-500 to-purple-500'
                                        }
                                    ].map((item) => (
                                        <button
                                            key={item.title}
                                            onClick={() => handleSendMessage(`${item.desc}`)}
                                            className="group relative p-6 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden"
                                        >
                                            {/* 渐变背景 - hover 时显示 */}
                                            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 ${item.color}`} />

                                            {/* 内容 */}
                                            <div className="relative">
                                                <div className="mb-3 text-slate-700 dark:text-gray-300">{item.icon}</div>
                                                <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-gray-400">
                                                    {item.desc}
                                                </p>
                                            </div>

                                            {/* 箭头图标 */}
                                            <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                                                <svg className="w-3 h-3 text-slate-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto pb-8">
                                {messages.map((msg, index) => (
                                    <MessageBubble
                                        key={index}
                                        message={msg}
                                        isStreaming={streamingMessageIndex === index}
                                        onTypingComplete={() => handleTypingComplete(index)}
                                    />
                                ))}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* 输入区域 - 固定在底部（红框） */}
                    <div className="flex-shrink-0 border-t border-slate-200/60 dark:border-gray-800/60 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.2)]">
                        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-4">
                            <InputArea
                                onSend={handleSendMessage}
                                disabled={isSending}
                                placeholder="输入你的问题..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ChatSidebar, MessageBubble, InputArea } from '@/components/features/assistant';
import { assistantApi } from '@/lib/api/assistant';
import { BotIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        setStreamingMessageIndex(messages.length + 1);

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

            // 更新AI回复
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: response.message,
                    created_at: new Date().toISOString(),
                };
                return newMessages;
            });
        } catch (error) {
            console.error('发送消息失败:', error);
            // 移除临时消息
            setMessages((prev) => prev.slice(0, -2));
        } finally {
            setIsSending(false);
            setStreamingMessageIndex(null);
        }
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
            <div className="flex h-screen bg-gray-50 dark:bg-black">
                {/* 侧边栏 - ChatSidebar */}
                <ChatSidebar
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={setCurrentConversationId}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                />

                {/* 主聊天区域 */}
                <div className="flex-1 flex flex-col">
                    {/* 标题栏 */}
                    {/* <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <BotIcon className="w-10 h-10 text-gray-700 dark:text-gray-300" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    AI 助手
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    智能对话与个性化推荐
                                </p>
                            </div>
                        </div>
                    </div> */}

                    {/* 消息列表 */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-gray-950">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                {/* AI 机器人图标 - 渐变背景 */}
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />
                                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 dark:shadow-blue-400/20">
                                        <BotIcon className="w-12 h-12 text-white" strokeWidth={2} />
                                    </div>
                                </div>

                                {/* 标题和描述 */}
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    开始新对话
                                </h3>
                                <p className="text-slate-600 dark:text-gray-400 max-w-md mb-12 text-base leading-relaxed">
                                    向 AI 助手提问，获取个性化推荐和内容分析
                                </p>

                                {/* 快捷建议卡片 - Grid 布局 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
                                    {[
                                        { icon: '🎬', title: '推荐电影', desc: '根据观看历史推荐', color: 'from-rose-500 to-pink-500' },
                                        { icon: '📊', title: '数据统计', desc: '分析观影趋势', color: 'from-blue-500 to-cyan-500' },
                                        { icon: '🏷️', title: '标签分析', desc: '总结内容类型', color: 'from-violet-500 to-purple-500' }
                                    ].map((item) => (
                                        <button
                                            key={item.title}
                                            onClick={() => handleSendMessage(`${item.desc}`)}
                                            className="group relative p-6 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden"
                                        >
                                            {/* 渐变背景 - hover 时显示 */}
                                            <div className={cn(
                                                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300",
                                                item.color
                                            )} />

                                            {/* 内容 */}
                                            <div className="relative">
                                                <div className="text-4xl mb-3">{item.icon}</div>
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

                                {/* 底部提示 */}
                                <div className="mt-12 flex items-center gap-2 text-xs text-slate-400 dark:text-gray-500">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>AI 助手已就绪</span>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto">
                                {messages.map((msg, index) => (
                                    <MessageBubble
                                        key={index}
                                        message={msg}
                                        isStreaming={streamingMessageIndex === index}
                                    />
                                ))}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* 输入区域 - 悬浮式设计 */}
                    <div className="relative px-6 py-6 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-950 dark:via-gray-950 dark:to-transparent">
                        <div className="max-w-4xl mx-auto">
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

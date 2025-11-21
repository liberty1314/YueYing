'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ChatSidebar, MessageBubble, InputArea } from '@/components/features/assistant';
import { assistantApi } from '@/lib/api/assistant';
import { BotIcon } from 'lucide-react';

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
            // 调用删除API（如果有）
            // await assistantApi.deleteConversation(id);
            await loadConversations();
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
                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-black">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <BotIcon className="w-20 h-20 text-gray-400 dark:text-gray-600 mb-6" />
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                    开始新对话
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                                    向 AI 助手提问，获取个性化推荐和内容分析
                                </p>
                                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                                    {['🎬 推荐电影', '📊 数据统计', '🏷️ 标签分析'].map((prompt) => (
                                        <button
                                            key={prompt}
                                            className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
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

                    {/* 输入区域 */}
                    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
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

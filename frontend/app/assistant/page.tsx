"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAssistantStore, type Message, type Conversation } from "@/store/assistantStore";
import { api } from "@/lib/api";
import { Bot, Send, Loader2, Plus, MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { DeleteConfirmDialog } from "@/components/library/DeleteConfirmDialog";

const QUICK_QUESTIONS = [
  "我最近看了什么电影？",
  "帮我推荐几部科幻电影",
  "我给了哪些作品5星评价？",
  "总结一下我今年的观影记录",
  "推荐一些适合周末看的轻松电影",
  "我最喜欢哪种类型的书？",
];

export default function AssistantPage() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 使用全局状态
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    setMessages,
    setConversations,
    setCurrentConversationId,
    addMessage,
    setLoading,
    clearCurrentConversation,
  } = useAssistantStore();
  
  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载对话列表
  const loadConversations = async () => {
    try {
      const response = await api.get<Conversation[]>("/assistant/conversations?limit=20");
      setConversations(response.data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  // 加载对话详情
  const loadConversation = async (conversationId: number) => {
    try {
      const response = await api.get(`/assistant/conversations/${conversationId}`);
      const { messages: conversationMessages } = response.data;
      setMessages(conversationMessages || []);
      setCurrentConversationId(conversationId);
      
      // 标记为已读
      useAssistantStore.getState().setHasUnreadMessages(false);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      toast({
        title: "加载失败",
        description: "无法加载对话历史",
        variant: "destructive",
      });
    }
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: content.trim(),
    };

    addMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/assistant/chat", {
        message: content.trim(),
        conversation_id: currentConversationId,
      });

      const { conversation_id, message: aiMessage } = response.data;

      // 如果是新对话，更新conversation ID
      if (!currentConversationId) {
        setCurrentConversationId(conversation_id);
        loadConversations();
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: aiMessage,
      };

      addMessage(assistantMessage);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast({
        title: "发送失败",
        description: error.response?.data?.detail || "无法发送消息",
        variant: "destructive",
      });
      // 移除用户消息
      setMessages(messages.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // 创建新对话
  const startNewConversation = () => {
    clearCurrentConversation();
  };

  // 打开删除确认对话框
  const openDeleteDialog = (conversation: Conversation) => {
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  // 删除对话
  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await api.delete(`/assistant/conversations/${conversationToDelete.id}`);
      toast({
        title: "删除成功",
        description: "对话已删除",
      });
      
      if (currentConversationId === conversationToDelete.id) {
        startNewConversation();
      }
      
      loadConversations();
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "删除失败",
        description: "无法删除对话",
        variant: "destructive",
      });
    }
  };

  // 初始加载
  useEffect(() => {
    loadConversations();
    
    // 当进入 AI 助手页面时，标记为已读
    useAssistantStore.getState().setHasUnreadMessages(false);
  }, []);

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] py-6">
      <div className="flex gap-6 h-full">
        {/* 侧边栏 - 对话历史 */}
        {showSidebar && (
          <Card className="w-80 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                对话历史
              </h2>
              <Button size="sm" variant="ghost" onClick={() => setShowSidebar(false)}>
                ×
              </Button>
            </div>

            <Button onClick={startNewConversation} className="mb-4 w-full">
              <Plus className="mr-2 h-4 w-4" />
              新对话
            </Button>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group hover:bg-accent ${
                      currentConversationId === conv.id ? "bg-accent" : ""
                    }`}
                  >
                    <div
                      className="flex-1"
                      onClick={() => loadConversation(conv.id)}
                    >
                      <p className="text-sm font-medium line-clamp-2 mb-1">
                        {conv.title || "新对话"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conv.message_count} 条消息 •{" "}
                        {format(new Date(conv.created_at), "MM/dd", { locale: zhCN })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(conv);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}

        {/* 主聊天区域 */}
        <Card className="flex-1 flex flex-col">
          {/* 头部 */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showSidebar && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSidebar(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">AI 助手</h1>
              </div>
            </div>
          </div>

          {/* 消息列表 */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">你好！我是你的AI助手</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  我可以帮你查询观影记录、推荐内容、分析你的喜好等。试试下面的快捷问题，或者直接开始对话吧！
                </p>

                {/* 预设问题 */}
                <div className="grid grid-cols-2 gap-3 max-w-2xl">
                  {QUICK_QUESTIONS.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto py-3 px-4 whitespace-normal"
                      onClick={() => sendMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                          你
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* 输入区域 */}
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入消息..."
                className="min-h-[60px] max-h-[200px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-[60px] w-[60px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </Card>
      </div>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConversation}
        title={conversationToDelete?.title || "此对话"}
      />
    </div>
  );
}


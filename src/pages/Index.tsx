import { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { TypingIndicator } from '@/components/TypingIndicator';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useChatHistory, ChatMsg } from '@/hooks/useChatHistory';
import { sendChatMessage } from '@/services/geminiService';
import { ScrollToBottomButton } from '@/components/ScrollToBottomButton';

export default function Index() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const skipLoadRef = useRef(false);

  const { currentChatId, createNewChat, ensureChat, loadMessages, refreshChats } = useChatHistory();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleScroll = () => {
    const c = chatContainerRef.current;
    if (c) setShowScrollButton(c.scrollHeight - c.scrollTop - c.clientHeight > 200);
  };

  useEffect(() => {
    if (skipLoadRef.current) { skipLoadRef.current = false; return; }
    if (!currentChatId) { setMessages([]); return; }
    let active = true;
    loadMessages(currentChatId).then(m => { if (active) setMessages(m); });
    return () => { active = false; };
  }, [currentChatId]);

  const handleSendMessage = async (message: string) => {
    const temp: ChatMsg = { id: `tmp-${Date.now()}`, text: message, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, temp]);
    setIsTyping(true);
    try {
      if (!currentChatId) skipLoadRef.current = true;
      const chatId = await ensureChat(message);
      const res = await sendChatMessage(chatId, message);
      setMessages(prev => [...prev, { id: res.id, text: res.reply, isUser: false, timestamp: new Date(res.created_at) }]);
      refreshChats();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Erro de Comunicação', description: error?.message ?? 'Tente novamente.', variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== temp.id));
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    createNewChat();
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <header className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm z-40">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1 flex justify-center"><ChatHeader /></div>
          <div><ThemeToggle /></div>
        </header>

        <main className="flex-1 flex flex-col relative pt-12">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div ref={chatContainerRef} className="flex-1 px-4 py-6 pb-24 overflow-y-auto" onScroll={handleScroll}>
              <div className="max-w-4xl mx-auto">
                {messages.map(m => (
                  <ChatMessage key={m.id} message={m.text} isUser={m.isUser} timestamp={m.timestamp} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
          <ScrollToBottomButton onClick={scrollToBottom} isVisible={showScrollButton} />
        </main>

        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} onNewChat={handleNewChat} showNewChatButton={messages.length > 0} />
      </div>
    </div>
  );
}

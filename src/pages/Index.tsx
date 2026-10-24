import { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { TypingIndicator } from '@/components/TypingIndicator';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
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
      <AppSidebar onHome={handleNewChat} />
      <div className="flex flex-col flex-1 pl-14 md:pl-[70px]">
        <header className="fixed top-0 left-14 md:left-[70px] right-0 h-16 flex items-center justify-center px-4 md:px-5 bg-background/80 backdrop-blur-sm z-40">
          <div className="md:-ml-[70px]"><ChatHeader /></div>
          <div className="absolute right-4 md:right-5"><ThemeToggle /></div>
        </header>

        <main className="flex-1 flex flex-col relative pt-16">
          {messages.length === 0 ? (
            <WelcomeScreen
              input={<ChatInput variant="hero" onSendMessage={handleSendMessage} disabled={isTyping} onNewChat={handleNewChat} />}
              onSelectTopic={handleSendMessage}
            />
          ) : (
            <div ref={chatContainerRef} className="flex-1 px-4 py-6 pb-36 overflow-y-auto" onScroll={handleScroll}>
              <div className="max-w-[912px] mx-auto">
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

        {messages.length > 0 && <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} onNewChat={handleNewChat} />}
      </div>
    </div>
  );
}

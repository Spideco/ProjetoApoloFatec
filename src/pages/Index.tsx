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
import { useChatHistory } from '@/hooks/useChatHistory';
import { GeminiService } from '@/services/geminiService';
import { ScrollToBottomButton } from '@/components/ScrollToBottomButton';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const HEADER_HEIGHT = 'h-12';
const HEADER_HEIGHT_PX = 48; // 3rem = 48px
const SIDEBAR_WIDTH = 'w-80';

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { toast } = useToast();
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [geminiService] = useState<GeminiService>(new GeminiService());
  const {
    currentChatId,
    currentChat,
    createNewChat,
    saveCurrentChat,
    clearCurrentChat,
  } = useChatHistory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      // Check if the user is scrolled up more than 200px from the bottom
      const scrollPosition = container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollButton(scrollPosition > 200);
    }
  };

  // Load selected chat messages
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages);
    } else {
      setMessages([]);
    }
  }, [currentChat]);

  // Auto-scroll on new message or chat load
  useEffect(() => {
    // Scroll to bottom when messages are loaded or updated, ensuring the latest content is visible.
    scrollToBottom();
  }, [messages.length, isTyping]);
  
  // Attach scroll listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
        container.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
        return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);


  // Save messages when they change (debounced)
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      const timeoutId = setTimeout(() => {
        saveCurrentChat(messages);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId, saveCurrentChat]);

  const handleSendMessage = async (message: string) => {
    // Create new chat if none exists
    if (!currentChatId) {
      createNewChat();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Preparar histórico incluindo a mensagem atual
      const conversationHistory = [...messages, userMessage].map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
      
      const aiResponseText = await geminiService.generateResponse(conversationHistory);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      toast({
        title: "Erro de Comunicação",
        description: "Não foi possível obter resposta da IA. Verifique sua chave da API.",
        variant: "destructive"
      });
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = createNewChat();
    setMessages([]);
    setIsTyping(false);
    toast({
      title: "Nova conversa iniciada",
      description: "Histórico limpo. Faça sua primeira pergunta!",
    });
  };


  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Fixed on desktop, uses Sheet on mobile */}
      <div className={`hidden md:block md:fixed md:top-0 md:bottom-0 ${SIDEBAR_WIDTH} z-20`}>
        <AppSidebar />
      </div>
        
      <div className={`flex flex-col flex-1 md:ml-[${SIDEBAR_WIDTH}]`}>
        {/* Header Fixo */}
        <header className={`fixed top-0 left-0 right-0 ${HEADER_HEIGHT} flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm z-30`}>
          <SidebarTrigger className="md:hidden z-40" />
          <div className="flex-1 flex justify-center">
            <ChatHeader />
          </div>
          <div>
            <ThemeToggle />
          </div>
        </header>

        <main className={`flex-1 flex flex-col relative pt-[${HEADER_HEIGHT_PX}px]`}>
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div 
              ref={chatContainerRef} 
              className="flex-1 px-4 py-6 pb-24 overflow-y-auto"
              onScroll={handleScroll}
            >
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
          
          <ScrollToBottomButton 
            onClick={scrollToBottom} 
            isVisible={showScrollButton} 
          />
        </main>

        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isTyping}
          onNewChat={handleNewChat}
          showNewChatButton={messages.length > 0}
        />
      </div>
    </div>
  );
}
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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
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

  // Load selected chat messages
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages);
    } else {
      setMessages([]);
    }
  }, [currentChat]);

  // Auto-scroll when messages change and typing stops
  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

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
    
    // Scroll down immediately after user sends message
    setTimeout(scrollToBottom, 100); 

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
      <AppSidebar />
        
        <div className="flex flex-col flex-1">
        <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1 flex justify-center">
            <ChatHeader />
          </div>
          <div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div className="flex-1 px-4 py-6 pb-24 overflow-y-auto">
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
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SavedChat {
  id: string;
  title: string;
  messages: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }[];
  lastMessage: string;
  timestamp: Date;
}

interface ChatHistoryContextType {
  chatHistory: SavedChat[];
  currentChatId: string | null;
  currentChat: SavedChat | null;
  createNewChat: () => string;
  selectChat: (chatId: string) => void;
  saveCurrentChat: (messages: any[], title?: string) => void;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  clearCurrentChat: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'apolo-chat-history';

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [chatHistory, setChatHistory] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const chatsWithDates = parsed.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatHistory(chatsWithDates);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever chatHistory changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const generateChatTitle = (messages: any[]): string => {
    const userMessages = messages.filter(msg => msg.isUser);
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].text;
      return firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...'
        : firstMessage;
    }
    return 'Nova conversa';
  };

  const createNewChat = (): string => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    return newChatId;
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const saveCurrentChat = (messages: any[], customTitle?: string) => {
    if (!currentChatId || messages.length === 0) return;

    const title = customTitle || generateChatTitle(messages);
    const lastMessage = messages[messages.length - 1]?.text || '';

    const chatToSave: SavedChat = {
      id: currentChatId,
      title,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp || new Date()
      })),
      lastMessage: lastMessage.length > 100 ? lastMessage.substring(0, 100) + '...' : lastMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => {
      const existingIndex = prev.findIndex(chat => chat.id === currentChatId);
      if (existingIndex >= 0) {
        // Update existing chat
        const updated = [...prev];
        updated[existingIndex] = chatToSave;
        return updated;
      } else {
        // Add new chat
        return [chatToSave, ...prev];
      }
    });
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const updateChatTitle = (chatId: string, title: string) => {
    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  };

  const clearCurrentChat = () => {
    setCurrentChatId(null);
  };

  const currentChat = currentChatId 
    ? chatHistory.find(chat => chat.id === currentChatId) || null
    : null;

  return (
    <ChatHistoryContext.Provider
      value={{
        chatHistory,
        currentChatId,
        currentChat,
        createNewChat,
        selectChat,
        saveCurrentChat,
        deleteChat,
        updateChatTitle,
        clearCurrentChat,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}
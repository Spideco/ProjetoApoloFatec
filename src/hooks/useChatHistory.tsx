import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ChatMsg {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface SavedChat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatHistoryContextType {
  chatHistory: SavedChat[];
  currentChatId: string | null;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  clearCurrentChat: () => void;
  ensureChat: (firstMessage: string) => Promise<string>;
  loadMessages: (chatId: string) => Promise<ChatMsg[]>;
  refreshChats: () => Promise<void>;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const refreshChats = useCallback(async () => {
    if (!user) { setChatHistory([]); return; }
    const { data, error } = await supabase
      .from('chats').select('id, title, last_message, updated_at')
      .order('updated_at', { ascending: false });
    if (error) { console.error(error); return; }
    setChatHistory((data ?? []).map(c => ({
      id: c.id, title: c.title, lastMessage: c.last_message, timestamp: new Date(c.updated_at),
    })));
  }, [user]);

  useEffect(() => {
    setCurrentChatId(null);
    refreshChats();
  }, [refreshChats]);

  const ensureChat = async (firstMessage: string) => {
    if (currentChatId) return currentChatId;
    const title = firstMessage.length > 50 ? firstMessage.slice(0, 50) + '...' : firstMessage;
    const { data, error } = await supabase
      .from('chats').insert({ user_id: user!.id, title, last_message: firstMessage.slice(0, 100) })
      .select('id').single();
    if (error) throw error;
    setCurrentChatId(data.id);
    return data.id;
  };

  const loadMessages = async (chatId: string): Promise<ChatMsg[]> => {
    const { data, error } = await supabase
      .from('messages').select('id, role, content, created_at')
      .eq('chat_id', chatId).order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return (data ?? []).map(m => ({
      id: m.id, text: m.content, isUser: m.role === 'user', timestamp: new Date(m.created_at),
    }));
  };

  const deleteChat = async (chatId: string) => {
    await supabase.from('chats').delete().eq('id', chatId);
    if (currentChatId === chatId) setCurrentChatId(null);
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    await supabase.from('chats').update({ title }).eq('id', chatId);
    setChatHistory(prev => prev.map(c => c.id === chatId ? { ...c, title } : c));
  };

  return (
    <ChatHistoryContext.Provider value={{
      chatHistory,
      currentChatId,
      createNewChat: () => setCurrentChatId(null),
      selectChat: setCurrentChatId,
      deleteChat,
      updateChatTitle,
      clearCurrentChat: () => setCurrentChatId(null),
      ensureChat,
      loadMessages,
      refreshChats,
    }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (!context) throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  return context;
}

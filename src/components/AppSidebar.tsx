import { useState } from 'react';
import { MessageSquarePlus, MessageSquare, Calendar, MoreHorizontal, Trash2, Edit3, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useChatHistory } from '@/hooks/useChatHistory';
interface ChatGroup {
  date: string;
  chats: {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
  }[];
}
export function AppSidebar() {
  const {
    chatHistory,
    currentChatId,
    createNewChat,
    selectChat,
    deleteChat,
    updateChatTitle
  } = useChatHistory();
  const {
    state,
    toggleSidebar
  } = useSidebar();
  const handleNewChat = () => {
    createNewChat();
  };
  const handleChatSelect = (chatId: string) => {
    selectChat(chatId);
  };
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
  };
  const formatChatsByDate = (): ChatGroup[] => {
    const groups: {
      [key: string]: ChatGroup;
    } = {};
    chatHistory.forEach(chat => {
      const date = chat.timestamp.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit'
      });
      if (!groups[date]) {
        groups[date] = {
          date,
          chats: []
        };
      }
      groups[date].chats.push(chat);
    });
    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  const chatGroups = formatChatsByDate();
  return <Sidebar className="w-80 border-r border-border bg-background" collapsible="icon">
      <SidebarContent className="p-0 bg-slate-950">
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            {state !== "collapsed" && <span className="font-semibold text-sm">Conversas</span>}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 hover:bg-accent">
            {state === "collapsed" ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {/* New Chat Button - only show when not collapsed */}
        {state !== "collapsed" && <div className="p-3 border-b border-border">
            <Button onClick={handleNewChat} className="w-full justify-start gap-3 bg-primary hover:bg-primary/90 text-primary-foreground">
              <MessageSquarePlus className="h-4 w-4" />
              <span>Novo Chat</span>
            </Button>
          </div>}

        {/* Collapsed new chat button */}
        {state === "collapsed" && <div className="p-2 bg-slate-950">
            <Button onClick={handleNewChat} variant="ghost" size="icon" className="w-full h-10 hover:bg-accent">
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </div>}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto bg-slate-950">
          {state !== "collapsed" ?
        // Full sidebar view
        chatGroups.map(group => <SidebarGroup key={group.date} className="px-3 py-2">
                <SidebarGroupLabel className="text-xs text-muted-foreground px-0 pb-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {group.date}
                </SidebarGroupLabel>
                
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.chats.map(chat => <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton onClick={() => handleChatSelect(chat.id)} className={`
                            relative group rounded-lg px-3 py-2 text-left w-full justify-start
                            ${currentChatId === chat.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}
                          `}>
                          <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-medium">
                              {chat.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground mt-0.5">
                              {chat.lastMessage}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={e => handleDeleteChat(chat.id, e)} className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir chat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuButton>
                      </SidebarMenuItem>)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>) :
        // Collapsed sidebar view - just show chat icons
        <div className="p-2 space-y-2">
              {chatHistory.slice(0, 10).map(chat => <Button key={chat.id} onClick={() => handleChatSelect(chat.id)} variant="ghost" size="icon" className={`w-full h-10 ${currentChatId === chat.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
                  <MessageSquare className="h-4 w-4" />
                </Button>)}
            </div>}
        </div>
      </SidebarContent>
    </Sidebar>;
}
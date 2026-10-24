import { useState } from 'react';
import { Home, MessageSquare, FileText, BarChart3, MoreHorizontal, Trash2, X, LucideIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileDialog } from '@/components/ProfileDialog';
import { ApoloLogo } from '@/components/ChatHeader';
import { cn } from '@/lib/utils';

interface ChatGroup {
  date: string;
  chats: {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
  }[];
}

interface AppSidebarProps {
  onHome?: () => void;
}

const RailButton = ({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active?: boolean; onClick: () => void }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={cn(
          'relative flex items-center justify-center w-full h-10 transition-colors',
          active ? 'text-primary' : 'text-sidebar-foreground hover:text-foreground'
        )}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-9 w-[3px] rounded-r-full bg-primary" />}
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </TooltipTrigger>
    <TooltipContent side="right">{label}</TooltipContent>
  </Tooltip>
);

export function AppSidebar({ onHome }: AppSidebarProps) {
  const { chatHistory, currentChatId, selectChat, deleteChat } = useChatHistory();
  const { user, profile, avatarSrc } = useAuth();
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const comingSoon = (feature: string) => toast({ title: feature, description: 'Em breve no Apolo.' });

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId);
    setHistoryOpen(false);
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
    return Object.values(groups);
  };
  const chatGroups = formatChatsByDate();

  return <>
      {/* Barra de ícones */}
      <aside className="fixed inset-y-0 left-0 z-50 flex flex-col items-center w-14 md:w-[70px] border-r border-sidebar-border bg-sidebar py-4">
        <button type="button" onClick={() => { setHistoryOpen(false); onHome?.(); }} aria-label="Apolo" className="mb-12">
          <ApoloLogo />
        </button>

        <nav className="flex flex-col w-full gap-2.5">
          <RailButton icon={Home} label="Início" active={!historyOpen} onClick={() => { setHistoryOpen(false); onHome?.(); }} />
          <RailButton icon={MessageSquare} label="Conversas" active={historyOpen} onClick={() => setHistoryOpen(o => !o)} />
          <RailButton icon={FileText} label="Simulados" onClick={() => comingSoon('Simulados')} />
          <RailButton icon={BarChart3} label="Desempenho" onClick={() => comingSoon('Desempenho')} />
        </nav>

        <button type="button" onClick={() => setProfileOpen(true)} className="mt-auto rounded-full" aria-label="Perfil">
          <Avatar className="h-9 w-9">
            {avatarSrc && <AvatarImage src={avatarSrc} />}
            <AvatarFallback className="bg-secondary text-foreground text-sm font-bold">{(profile?.display_name || user?.email || '?').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      </aside>

      {/* Painel de conversas */}
      {historyOpen && <div className="fixed inset-0 z-[45] bg-black/30 md:bg-transparent" onClick={() => setHistoryOpen(false)} />}
      <div className={cn(
        'fixed inset-y-0 left-14 md:left-[70px] z-[45] w-72 flex flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200',
        historyOpen ? 'translate-x-0' : '-translate-x-[calc(100%+70px)]'
      )}>
        <div className="flex items-center justify-between h-16 px-4">
          <span className="font-bold text-foreground">Conversas</span>
          <button type="button" onClick={() => setHistoryOpen(false)} className="text-sidebar-foreground hover:text-foreground" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {chatGroups.length === 0 && <p className="px-2 text-sm text-muted-foreground">Nenhuma conversa ainda.</p>}
          {chatGroups.map(group => <div key={group.date} className="mb-4">
              <div className="px-2 pb-2 text-xs text-muted-foreground">{group.date}</div>
              {group.chats.map(chat => <div key={chat.id} onClick={() => handleChatSelect(chat.id)} className={cn(
                'group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors',
                currentChatId === chat.id ? 'bg-sidebar-accent text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
              )}>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-bold">{chat.title}</div>
                    <div className="truncate text-xs text-muted-foreground mt-0.5">{chat.lastMessage}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-secondary transition-opacity" onClick={e => e.stopPropagation()} aria-label="Opções">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={e => handleDeleteChat(chat.id, e)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>)}
            </div>)}
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>;
}

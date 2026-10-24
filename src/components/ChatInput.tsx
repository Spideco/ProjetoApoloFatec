import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  onNewChat?: () => void;
  /** "hero": campo central da tela inicial; "dock": fixo no rodapé durante a conversa */
  variant?: 'hero' | 'dock';
}

export const ChatInput = ({ onSendMessage, disabled = false, onNewChat, variant = 'dock' }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Cresce conforme o texto, até um limite
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const field = (
    <div className="flex items-center gap-3 w-full min-h-[64px] md:min-h-[80px] rounded-[40px] border border-border bg-card/70 pl-3 md:pl-[18px] pr-3 md:pr-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-colors focus-within:border-primary/60">
      <button
        type="button"
        onClick={onNewChat}
        className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-secondary text-foreground hover:bg-secondary/70 transition-colors"
        aria-label="Novo chat"
        title="Novo chat"
      >
        <Plus className="h-5 w-5" />
      </button>
      <textarea
        ref={textareaRef}
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isMobile ? "Pergunte algo..." : "Pergunte qualquer coisa sobre o ENEM..."}
        className="flex-1 resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground/90 outline-none leading-6 py-2 max-h-40"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-90 disabled:cursor-not-allowed enabled:hover:scale-105"
        aria-label="Enviar"
      >
        <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
      </button>
    </div>
  );

  if (variant === 'hero') return field;

  return (
    <div className="fixed bottom-0 right-0 left-14 md:left-[70px] px-4 pb-5 pt-8 bg-gradient-to-t from-background via-background/95 to-transparent z-30">
      <div className="max-w-[912px] mx-auto lg:-translate-x-[35px]">{field}</div>
    </div>
  );
};

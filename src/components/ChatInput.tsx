import { useState, KeyboardEvent } from 'react';
import { Send, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  onNewChat?: () => void;
  showNewChatButton?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled = false, onNewChat, showNewChatButton = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input fixed bottom-0 left-0 right-0 p-4 border-t border-border backdrop-blur-sm bg-background/80">
      <div className="max-w-4xl mx-auto flex gap-3 items-end">
        {showNewChatButton && (
          <Button
            onClick={onNewChat}
            className="h-[52px] w-[52px] p-0 flex-shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            size="icon"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta em inglês ou português..."
            className="min-h-[52px] max-h-32 resize-none rounded-2xl border-border focus:ring-primary focus:border-primary pr-12 bg-card pt-3"
            disabled={disabled}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="send-button rounded-xl h-[52px] w-[52px] p-0 flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
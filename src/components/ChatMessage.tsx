import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessage = (text: string) => {
    // Simple markdown support for bold, italic, and code
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className={`message-container flex w-full mb-4 message-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 relative group ${
        isUser 
          ? 'user-message rounded-br-md' 
          : 'ai-message rounded-bl-md'
      }`}>
        <div 
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
        />
        
        {timestamp && (
          <div className="text-xs text-muted-foreground mt-2 opacity-70">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        
        {!isUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="copy-button absolute -top-2 -right-2 h-6 w-6 p-0 bg-background border border-border shadow-sm hover:bg-muted"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
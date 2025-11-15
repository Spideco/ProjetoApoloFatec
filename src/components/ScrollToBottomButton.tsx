import { ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const ScrollToBottomButton = ({ onClick, isVisible }: ScrollToBottomButtonProps) => {
  return (
    <div className={cn(
      "fixed bottom-[80px] right-4 md:right-[calc(50%-200px)] transition-opacity duration-300 z-20",
      isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
    )}>
      <Button
        onClick={onClick}
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full shadow-lg bg-background hover:bg-muted border-border"
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
};
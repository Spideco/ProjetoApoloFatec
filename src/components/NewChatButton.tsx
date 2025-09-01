import { Plus } from 'lucide-react';
import { Button } from './ui/button';
interface NewChatButtonProps {
  onClick: () => void;
}
export const NewChatButton = ({
  onClick
}: NewChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
      size="icon"
    >
      <Plus className="h-5 w-5" />
    </Button>
  );
};
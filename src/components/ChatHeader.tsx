import { GraduationCap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const ChatHeader = () => {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
        <GraduationCap className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col items-center">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Apolo</h1>
        <p className="text-xs text-muted-foreground">O conhecimento na palma da sua mão</p>
      </div>
      <div className="ml-4 md:hidden">
        <ThemeToggle />
      </div>
    </div>
  );
};
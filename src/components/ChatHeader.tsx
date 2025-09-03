import { GraduationCap } from 'lucide-react';

export const ChatHeader = () => {
  return <div className="flex items-center justify-center gap-3 py-2">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Apolo</h1>
        </div>
        
      </div>
    </div>;
};
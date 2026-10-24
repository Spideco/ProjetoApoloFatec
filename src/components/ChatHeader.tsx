import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ApoloLogo = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary text-primary', className)}>
    <GraduationCap className="h-[55%] w-[55%]" strokeWidth={2} />
  </div>
);

export const ChatHeader = () => {
  return <div className="flex items-center justify-center gap-2.5">
      <ApoloLogo className="w-8 h-8 md:w-9 md:h-9" />
      <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Apolo</h1>
    </div>;
};

import { Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <Sun className="hidden sm:block h-5 w-5 text-foreground/80" strokeWidth={1.75} />
      <Switch
        disabled={!mounted}
        checked={mounted && theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        className="h-7 w-12 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 [&>span]:h-6 [&>span]:w-6 [&>span]:bg-white [&>span]:data-[state=checked]:translate-x-5"
        aria-label="Alternar tema"
      />
    </div>
  );
};

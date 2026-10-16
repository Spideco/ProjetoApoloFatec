import { useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Mode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name } },
        });
        if (error) throw error;
        toast.success('Conta criada! Confirme seu e-mail para entrar.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Enviamos um link de recuperação para seu e-mail.');
        setMode('login');
      }
    } catch (err: any) {
      const m = err?.message ?? 'Erro';
      toast.error(m.includes('Invalid login') ? 'E-mail ou senha incorretos.' : m.includes('not confirmed') ? 'Confirme seu e-mail antes de entrar.' : m);
    } finally {
      setBusy(false);
    }
  };

  const titles = { login: 'Entrar no Apolo', signup: 'Criar conta', forgot: 'Recuperar senha' };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-2xl font-semibold text-foreground">Apolo</span>
          </div>
          <h1 className="text-sm text-muted-foreground">{titles[mode]}</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required maxLength={60} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground space-y-2">
          {mode === 'login' && (
            <>
              <button className="hover:text-primary" onClick={() => setMode('forgot')}>Esqueci minha senha</button>
              <div>Não tem conta? <button className="text-primary font-medium" onClick={() => setMode('signup')}>Cadastre-se</button></div>
            </>
          )}
          {mode !== 'login' && (
            <button className="text-primary font-medium" onClick={() => setMode('login')}>Voltar para o login</button>
          )}
        </div>
      </div>
    </div>
  );
}

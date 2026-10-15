import { useEffect, useState, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user, profile, avatarSrc, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { setName(profile?.display_name ?? ''); }, [profile, open]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ display_name: name.trim(), updated_at: new Date().toISOString() }).eq('id', user.id);
    setBusy(false);
    if (error) return toast.error('Não foi possível salvar.');
    await refreshProfile();
    toast.success('Perfil atualizado!');
  };

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) return toast.error('Escolha uma imagem.');
    setBusy(true);
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (!error) await supabase.from('profiles').update({ avatar_url: path }).eq('id', user.id);
    setBusy(false);
    if (error) return toast.error('Falha ao enviar a foto.');
    await refreshProfile();
    toast.success('Foto atualizada!');
  };

  const initial = (profile?.display_name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Meu perfil</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-20 w-20">
            {avatarSrc && <AvatarImage src={avatarSrc} />}
            <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
          </Avatar>
          <Label htmlFor="avatar" className="cursor-pointer text-sm text-primary">Trocar foto</Label>
          <input id="avatar" type="file" accept="image/*" className="hidden" onChange={upload} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dn">Nome</Label>
          <Input id="dn" value={name} onChange={e => setName(e.target.value)} maxLength={60} />
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={signOut}>Sair</Button>
          <Button onClick={save} disabled={busy}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

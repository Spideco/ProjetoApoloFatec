import { supabase } from '@/integrations/supabase/client';

// A chave da IA fica protegida no servidor; aqui apenas chamamos a função "chat".
export async function sendChatMessage(chatId: string, message: string) {
  const { data, error } = await supabase.functions.invoke('chat', { body: { chatId, message } });
  if (error) {
    let msg = 'Não foi possível obter resposta da IA.';
    try {
      const body = await (error as any).context?.json?.();
      if (body?.error) msg = body.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data as { reply: string; id: string; created_at: string };
}

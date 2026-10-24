import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MEMORY_SIZE = 30; // últimas mensagens que a IA lembra por chat

const SYSTEM_PROMPT = `Você é o "Apolo", um assistente educacional especializado em preparação para o ENEM (Exame Nacional do Ensino Médio).

ESPECIALIDADES: todas as disciplinas do ENEM (Matemática, Linguagens, Ciências da Natureza, Ciências Humanas, Redação), metodologias de estudo, estratégias de prova e análise de questões anteriores.

ESTILO: didático e claro, com exemplos práticos e analogias; estruture com tópicos quando apropriado; inclua dicas específicas do ENEM; seja encorajador.

CONTINUIDADE: você tem memória desta conversa. Retome de forma orgânica o que já foi discutido ("Como vimos antes...", "Continuando..."), conecte conceitos e lembre informações que o estudante compartilhou (nome, dificuldades, metas). Nunca trate cada pergunta isoladamente.

FORMATO: use markdown; tom professoral, mas acessível; termine com uma pergunta ou sugestão de próximo passo.`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return json({ error: "Não autenticado" }, 401);

    const { chatId, message } = await req.json();
    if (!chatId || typeof message !== "string" || !message.trim() || message.length > 8000) {
      return json({ error: "Requisição inválida" }, 400);
    }

    const { data: chat } = await supabase.from("chats").select("id").eq("id", chatId).maybeSingle();
    if (!chat) return json({ error: "Chat não encontrado" }, 404);

    const { error: insErr } = await supabase.from("messages")
      .insert({ chat_id: chatId, user_id: user.id, role: "user", content: message.trim() });
    if (insErr) throw insErr;

    const { data: recent } = await supabase.from("messages")
      .select("role, content").eq("chat_id", chatId)
      .order("created_at", { ascending: false }).limit(MEMORY_SIZE);
    const history = (recent ?? []).reverse();

    const messages: { role: string; content: string }[] = [{ role: "system", content: SYSTEM_PROMPT }];
    for (const m of history) {
      messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.content });
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) return json({ error: "Chave da IA não configurada" }, 500);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 4096,
      }),
    });
    if (!res.ok) {
      console.error("Groq error", res.status, await res.text());
      return json({ error: res.status === 429 ? "Muitas requisições, tente novamente em instantes." : "Falha ao falar com a IA." }, res.status === 429 ? 429 : 502);
    }
    const data = await res.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? "";
    if (!reply) return json({ error: "A IA não retornou resposta." }, 502);

    const { data: saved, error: saveErr } = await supabase.from("messages")
      .insert({ chat_id: chatId, user_id: user.id, role: "assistant", content: reply })
      .select("id, created_at").single();
    if (saveErr) throw saveErr;

    await supabase.from("chats").update({
      last_message: reply.slice(0, 100),
      updated_at: new Date().toISOString(),
    }).eq("id", chatId);

    return json({ reply, id: saved.id, created_at: saved.created_at });
  } catch (e) {
    console.error(e);
    return json({ error: "Erro interno" }, 500);
  }
});

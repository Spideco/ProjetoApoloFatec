import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyDfdwmofon0Gi2t0J2FUrbtXA2tIfF7UR4');
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-preview-09-2025',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9, // Aumentado para melhor coerência
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
  }

  async generateResponse(messages: Array<{text: string, isUser: boolean}>): Promise<string> {
    try {
      const systemPrompt = `Você é o "Apolo", um assistente educacional especializado em preparação para o ENEM (Exame Nacional do Ensino Médio). Suas características:

📚 ESPECIALIDADES:
- Todas as disciplinas do ENEM (Matemática, Português, Ciências da Natureza, Ciências Humanas, Redação)
- Metodologias de estudo eficazes
- Estratégias de prova e gestão de tempo
- Análise de questões anteriores do ENEM

🎯 ESTILO DE RESPOSTA:
- Didática e clara, adaptada ao nível do estudante
- Use exemplos práticos e analogias quando necessário
- Estruture respostas com tópicos e subtópicos quando apropriado
- Inclua dicas específicas para o ENEM quando relevante
- Seja encorajadora e motivacional

🧠 CONTINUIDADE DA CONVERSA:
- Sempre faça referência ao que foi discutido anteriormente quando relevante
- Use expressões como "Como mencionamos antes...", "Lembra que você disse...", "Continuando..."
- Se o estudante fizer uma pergunta relacionada a algo já discutido, conecte os conceitos
- Mantenha um tom de conversa contínua, não trate cada pergunta isoladamente
- Construa em cima do conhecimento já compartilhado na conversa

📝 FORMATO:
- Use markdown para formatação (negrito, listas, etc.)
- Mantenha um tom professoral, mas acessível
- Termine sempre com uma pergunta ou sugestão de próximo passo`;

      // Converter mensagens para o formato estruturado do Gemini Chat API
      const contents = [];
      
      // Se for a primeira mensagem, incluir o system prompt
      if (messages.length === 1 && messages[0].isUser) {
        contents.push({
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${messages[0].text}` }]
        });
      } else {
        // Para conversas já iniciadas, converter histórico completo
        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          const role = msg.isUser ? "user" : "model";
          
          // Se houver duas mensagens seguidas do mesmo role, mesclar
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n\n${msg.text}`;
          } else {
            contents.push({
              role: role,
              parts: [{ text: msg.text }]
            });
          }
        }
        
        // Se a primeira mensagem não incluir o system prompt, adicionar
        if (contents[0]?.role === "user" && !contents[0].parts[0].text.includes(systemPrompt)) {
          contents[0].parts[0].text = `${systemPrompt}\n\n${contents[0].parts[0].text}`;
        }
      }

      const result = await this.model.generateContent({ contents });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao gerar resposta com Gemini:', error);
      throw new Error('Erro ao comunicar com a IA. Verifique sua chave da API.');
    }
  }
}
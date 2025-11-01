import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyDfdwmofon0Gi2t0J2FUrbtXA2tIfF7UR4');
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
  }

  async generateResponse(messages: Array<{text: string, isUser: boolean}>): Promise<string> {
    try {
      // Construir o histórico da conversa
      const conversationHistory = messages.map(msg => 
        `${msg.isUser ? 'Estudante' : 'Apolo'}: ${msg.text}`
      ).join('\n\n');

      const prompt = `Você é o "Apolo", um assistente educacional especializado em preparação para o ENEM (Exame Nacional do Ensino Médio). Suas características:

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
- LEMBRE-SE do contexto da conversa anterior para manter continuidade

📝 FORMATO:
- Use markdown para formatação (negrito, listas, etc.)
- Mantenha um tom professoral, mas acessível
- Termine sempre com uma pergunta ou sugestão de próximo passo

${conversationHistory ? `Histórico da conversa:\n${conversationHistory}\n\n` : ''}

Responda de forma completa e educativa, considerando todo o contexto da conversa:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao gerar resposta com Gemini:', error);
      throw new Error('Erro ao comunicar com a IA. Verifique sua chave da API.');
    }
  }
}
import { MessageCircle, BookOpen, Target, Brain } from 'lucide-react';
export const WelcomeScreen = () => {
  const features = [{
    icon: <MessageCircle className="h-6 w-6 text-primary" />,
    title: "Conversação Natural",
    description: "Faça perguntas em português ou inglês de forma natural"
  }, {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    title: "Todas as Matérias",
    description: "Matemática, Português, Ciências, História e mais"
  }, {
    icon: <Target className="h-6 w-6 text-primary" />,
    title: "Foco no ENEM",
    description: "Conteúdo específico e estratégias para o exame"
  }, {
    icon: <Brain className="h-6 w-6 text-primary" />,
    title: "Explicações Claras",
    description: "Respostas detalhadas e didáticas para seu aprendizado"
  }];
  return <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Bem-vindo ao Apolo</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">Seu assistente inteligente para estudar e se preparar para o ENEM. Faça perguntas, tire dúvidas e aprenda de forma interativa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => <div key={index} className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                {feature.description}
              </p>
            </div>)}
        </div>

        
      </div>
    </div>;
};
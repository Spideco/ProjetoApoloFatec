import { ReactNode } from 'react';
import { Calculator, BookOpen, Leaf, Globe, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  input: ReactNode;
  onSelectTopic: (prompt: string) => void;
}

export const WelcomeScreen = ({ input, onSelectTopic }: WelcomeScreenProps) => {
  const topics = [{
    icon: Calculator,
    title: "Matemática",
    description: "Resolva questões passo a passo",
    prompt: "Quero estudar Matemática para o ENEM. Me ajude a resolver questões passo a passo."
  }, {
    icon: BookOpen,
    title: "Linguagens",
    description: "Interprete textos e pratique redação",
    prompt: "Quero estudar Linguagens para o ENEM. Me ajude a interpretar textos e praticar redação."
  }, {
    icon: Leaf,
    title: "Ciências da Natureza",
    description: "Revise os principais conceitos",
    prompt: "Quero revisar os principais conceitos de Ciências da Natureza para o ENEM."
  }, {
    icon: Globe,
    title: "Ciências Humanas",
    description: "Conecte história, geografia e sociedade",
    prompt: "Quero estudar Ciências Humanas para o ENEM, conectando história, geografia e sociedade."
  }];

  return <div className="flex-1 flex items-start justify-center px-4 pt-[12vh] md:pt-[18vh] pb-12">
      <div className="max-w-[912px] w-full lg:-translate-x-[35px]">
        <div className="text-center mb-8 md:mb-9">
          <h2 className="text-[32px] md:text-[48px] leading-tight font-bold text-foreground mb-3 md:mb-4 tracking-tight">Olá, vamos estudar?</h2>
          <p className="text-base md:text-[19px] text-muted-foreground leading-[1.6] max-w-[660px] mx-auto">Seu espaço de preparação para o ENEM. Tire dúvidas, explore matérias e aprenda no seu ritmo.</p>
        </div>

        <div className="mb-10 md:mb-11">{input}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {topics.map(({ icon: Icon, title, description, prompt }) => <button key={title} type="button" onClick={() => onSelectTopic(prompt)} className="group flex items-center gap-5 text-left rounded-xl border border-border bg-card/60 px-6 py-5 md:h-[88px] hover:border-primary/50 hover:bg-card transition-colors duration-200">
              <Icon className="h-8 w-8 shrink-0 text-primary" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground truncate">{description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
            </button>)}
        </div>
      </div>
    </div>;
};

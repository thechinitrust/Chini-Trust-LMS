import { ChatInterface } from "@/components/chat/chat-interface";
import { Reveal } from "@/components/motion/reveal";

export default function AiNeuroGuidePage() {
  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Guided support</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">NeuroGuide</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          A calm, supportive assistant for quick guidance on neurodiversity, inclusion, and
          learning support. Ask anything — there&apos;s no such thing as a small question.
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mx-auto mt-12 max-w-3xl">
        <ChatInterface />
      </Reveal>
    </div>
  );
}

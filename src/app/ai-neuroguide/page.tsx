import { ChatInterface } from "@/components/chat/chat-interface";

export default function AiNeuroGuidePage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI NeuroGuide</h1>
        <p className="mt-3 text-muted-foreground">
          A calm, supportive AI assistant for quick guidance on neurodiversity, inclusion, and
          learning support. Ask anything — there&apos;s no such thing as a small question.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        <ChatInterface />
      </div>
    </div>
  );
}

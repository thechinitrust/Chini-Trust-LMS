"use client";

import * as React from "react";
import { Send, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { ChatMessage } from "@/lib/types";
import { EXAMPLE_PROMPTS, getMockAIResponse } from "@/lib/mock-ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatBubble } from "@/components/chat/chat-bubble";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm NeuroGuide. Ask me about supporting neurodivergent students, employees, or family members — I'm here to help, no question is too small.",
  createdAt: new Date().toISOString(),
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-pulse rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatInterface() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // TODO(supabase/ai): swap this timeout for a real request to an AI backend.
    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: getMockAIResponse(trimmed),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex h-[min(72vh,720px)] flex-col overflow-hidden rounded-3xl border border-black/5 bg-card shadow-soft-lg dark:border-white/10">
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-6 py-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Brain className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">NeuroGuide</p>
          <p className="text-xs text-muted-foreground">Supportive guidance, available anytime</p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChatBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Brain className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <TypingIndicator />
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 border-t border-border px-6 py-4">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary-text"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex items-end gap-2 border-t border-border p-5"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask NeuroGuide a question..."
          className="min-h-12 flex-1 resize-none rounded-2xl"
          rows={1}
          aria-label="Message"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isTyping} aria-label="Send message">
          <Send className="size-4" strokeWidth={1.5} />
        </Button>
      </form>
    </div>
  );
}

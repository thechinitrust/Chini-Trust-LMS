/**
 * Canned, keyword-matched responses standing in for a real AI backend.
 *
 * TODO(supabase/ai): replace getMockAIResponse with a call to an edge
 * function (e.g. Supabase Edge Function) that proxies to an LLM, optionally
 * grounded in the resource library via retrieval. Keep the ChatMessage
 * shape (src/lib/types.ts) unchanged so ChatInterface doesn't need to change.
 */

interface CannedResponse {
  keywords: string[];
  response: string;
}

const CANNED_RESPONSES: CannedResponse[] = [
  {
    keywords: ["dyslexia", "reading", "read"],
    response:
      "Supporting a student with dyslexia works best when you combine structured, explicit phonics instruction with dyslexia-friendly formatting — larger spacing, a clear sans-serif font, and shorter paragraphs. Pair written material with audio where possible, give extra time for reading tasks, and focus feedback on ideas rather than spelling accuracy. Our 'Supporting Dyslexia' course covers this in more depth under Learn.",
  },
  {
    keywords: ["autis", "accommodat", "employee", "workplace", "employer"],
    response:
      "Helpful accommodations for autistic employees often include predictable routines, written instructions alongside verbal ones, flexibility around sensory environment (lighting, noise, seating), and clear, literal communication. Small, low-cost changes like agenda-sharing before meetings tend to have an outsized impact. Take a look at 'Workplace Inclusion' in the Learn section for a full walkthrough.",
  },
  {
    keywords: ["classroom", "inclusive", "teacher", "school"],
    response:
      "An inclusive classroom starts with flexible participation options (not everyone needs to answer out loud), predictable routines, and sensory-friendly seating choices. Offer instructions in more than one format (spoken + written), and build in movement or quiet breaks. Our Resources page has a downloadable classroom strategies guide you might find useful.",
  },
  {
    keywords: ["adhd", "focus", "attention", "distract"],
    response:
      "ADHD-friendly support usually means externalizing structure: visible timers, checklists, and breaking tasks into smaller steps. Body-doubling (working alongside someone else) and movement breaks can also help sustain attention. The 'ADHD Explained' course walks through the underlying science if you'd like to go deeper.",
  },
  {
    keywords: ["parent", "child", "diagnos"],
    response:
      "A fresh diagnosis can feel overwhelming — a good first step is learning the language your child's team uses (IEP/504 terms if you're in the US) and connecting with a parent community. Our Parent Toolkit resource has conversation starters and meeting-prep templates that many families find grounding.",
  },
];

const FALLBACK_RESPONSES = [
  "That's a great question. While I'm running in demo mode right now, once connected to our full knowledge base I'll be able to give you a detailed, personalized answer. In the meantime, take a look at the Learn and Resources sections — they cover a lot of related ground.",
  "I hear you. I don't have a complete answer for that in demo mode yet, but our course library and resource guides are a strong starting point while this feature is finished.",
];

export function getMockAIResponse(question: string): string {
  const lower = question.toLowerCase();
  const match = CANNED_RESPONSES.find((entry) => entry.keywords.some((k) => lower.includes(k)));
  if (match) return match.response;
  return FALLBACK_RESPONSES[question.length % FALLBACK_RESPONSES.length];
}

export const EXAMPLE_PROMPTS = [
  "How can I support a student with dyslexia?",
  "What accommodations help autistic employees?",
  "How can I create an inclusive classroom?",
  "What routines help with ADHD focus?",
];

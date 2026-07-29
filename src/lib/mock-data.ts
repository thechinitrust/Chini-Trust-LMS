import type { TeamMember } from "@/lib/types";

/**
 * Placeholder team roster for the About page. Photos are Unsplash portraits
 * standing in for real staff headshots — swap these records wholesale once
 * the trust supplies real names, roles and photography. No Supabase table
 * backs this (deliberately out of scope — see docs/supabase-integration.md).
 */
export const mockTeam: TeamMember[] = [
  {
    id: "team-1",
    name: "Dr. Amara Osei",
    role: "Director of Learning",
    bio: "Educational psychologist who designs the course curriculum and keeps it anchored to current evidence.",
    photoUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "team-2",
    name: "Ravi Menon",
    role: "Accessibility Lead",
    bio: "Works with neurodivergent testers to make sure every screen is usable before it ships.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "team-3",
    name: "Sofia Lindqvist",
    role: "Head of Content",
    bio: "Turns long-form research into plain-language lessons and downloadable classroom tools.",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "team-4",
    name: "Daniel Whitfield",
    role: "Community & Partnerships",
    bio: "Connects schools, families and employers to the support that actually fits their situation.",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&q=80",
  },
];

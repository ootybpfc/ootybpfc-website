// Type definitions for OOTYBPFC Website
// Mirrors the backend Pydantic models

export interface MeResponse {
  id: number;
  email: string;
  name: string;
  role: "admin" | "coach" | "guardian" | "player";
  phone?: string;
}

export interface OkResponse {
  ok: boolean;
}

export interface PublicSummary {
  club_name: string;
  season: string;
  upcoming_events: UpcomingEvent[];
  standings: StandingEntry[];
  news: NewsItem[];
  sponsors: Sponsor[];
  gallery_images: string[];
  programs: ProgramSummary[];
}

export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  type: string;
  timezone: string;
}

export interface StandingEntry {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image_url?: string;
}

export interface Sponsor {
  name: string;
  tier: "jersey" | "platinum" | "gold" | "silver";
  logo_url?: string;
  website?: string;
}

export interface ProgramSummary {
  id: number;
  name: string;
  description: string;
  age_range: string;
  price: number;
  currency: string;
  period: string;
  start_date?: string;
}

export interface EventDetail {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  timezone: string;
  rsvp_count: number;
  max_capacity?: number;
}

export interface PlayerProfile {
  id: number;
  name: string;
  position: string;
  number: number;
  photo_url?: string;
  goals: number;
  assists: number;
  appearances: number;
}

export interface PaymentRecord {
  id: number;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
}

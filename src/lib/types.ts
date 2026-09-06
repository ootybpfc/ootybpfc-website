// Type definitions for the Ooty Black Pearl FC portal.
//
// These mirror the backend's Pydantic response models. Nothing infers across the Python
// boundary, so every shape here was verified against a live response from
// /api/<endpoint> — keep the two in sync when the backend changes.

/* ============ Shared primitives ============ */

export type Role = "admin" | "coach" | "guardian" | "player";

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface OkResponse {
  ok: boolean;
  message?: string;
}

/* ============ Auth & session ============ */

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  org_id: string;
  org_name: string;
  portal_id: string;
}

export interface OtpRequestResult {
  email: string;
  name: string;
  role: Role;
  expires_in_seconds: number;
  /** Only present while the backend runs without an SMTP sender configured. */
  demo_code?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  org_id: string;
  org_name?: string;
  portal_id?: string;
  phone?: string;
  created_at?: string;
}

/* ============ Clubs, pricing & programs ============ */

export interface Organization {
  id: string;
  name: string;
  country: string;
  timezone: string;
  currency: string;
}

export interface PriceOption {
  lookup_key: string;
  label: string;
  amount: number;
  currency: string;
  kind: string;
}

export interface Program {
  id: string;
  name: string;
  age_range: string;
  image_url: string;
  summary: string;
  highlights: string[];
  fee_lookup_key: string | null;
  active: boolean;
  sort_order: number;
}

export interface ClassSession {
  id: string;
  program_id: string;
  program_name: string;
  org_id: string;
  org_name: string;
  weekday: Weekday;
  start_time: string;
  end_time: string;
  venue: string;
  capacity: number;
  fee_lookup_key: string;
  amount: number;
  currency: string;
  enrolled_count: number;
  active: boolean;
}

/* ============ Events & attendance ============ */

export interface ClubEvent {
  id: string;
  org_id: string;
  org_name: string;
  title: string;
  kind: string;
  starts_at: string;
  location: string;
  venue_timezone: string;
  coach_id: string;
  coach_name: string;
  fee_lookup_key: string;
  fee_label: string;
  late_cancel_rule: string;
  confirmed_in: number;
  confirmed_out: number;
  no_response: number;
  created_at: string;
}

export interface AttendanceLogEntry {
  status: string;
  changed_at: string;
  changed_by: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  player_id: string;
  player_name: string;
  status: "in" | "out" | "no_response";
  timestamp_log: AttendanceLogEntry[];
  updated_at: string;
}

export interface EventDetail {
  event: ClubEvent;
  attendance: Attendance[];
}

export interface ClassRosterRow {
  player_id: string;
  player_name: string;
  present: boolean | null;
  attended: number;
  sessions_marked: number;
  attendance_rate: number;
  at_risk: boolean;
}

export interface ClassRoster {
  session: ClassSession;
  class_date: string;
  recent_dates: string[];
  rows: ClassRosterRow[];
  present_count: number;
  absent_count: number;
  unmarked_count: number;
}

/* ============ Players & media ============ */

export interface Player {
  id: string;
  guardian_id: string;
  guardian_name: string;
  org_id: string;
  org_name: string;
  full_name: string;
  dob: string;
  jersey_no: number;
  position: string;
  team_name: string;
  coach_id: string;
  waiver_version: string;
  waiver_signed_at: string;
  medical_notes: string;
  emergency_contact: string;
  bio: string;
  goals: number;
  assists: number;
  appearances: number;
  portfolio_status: string;
  registration_paid: boolean;
  created_at: string;
}

export interface MediaPost {
  id: string;
  player_id: string;
  player_name: string;
  caption: string;
  kind: string;
  url: string;
  public_id: string;
  resource_type: string;
  status: "pending" | "approved" | "rejected" | string;
  submitted_by: string;
  approved_by: string;
  created_at: string;
}

export interface MediaCreatePayload {
  player_id: string;
  caption: string;
  kind: string;
  url: string;
  /** Cloudinary-only. Absent when a guardian pastes an external media URL. */
  public_id?: string;
  resource_type?: string;
}

export interface CloudinaryConfig {
  configured: boolean;
  cloud_name: string;
  missing: string[];
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
  folder: string;
  resource_type: string;
}

/* ============ Coaches ============ */

export interface Coach {
  id: string;
  user_id: string;
  name: string;
  email: string;
  org_id: string;
  org_name: string;
  org_ids: string[];
  org_names: string[];
  status: string;
  phone: string;
  experience: string;
  team_name: string;
  payout_percentage: number;
  background_check_status: string;
  background_check_expiry: string;
  created_at: string;
}

export interface CoachInvite {
  id: string;
  token: string;
  name: string;
  email: string;
  org_ids: string[];
  org_names: string[];
  team_name: string;
  payout_percentage: number;
  status: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  email_status: string;
  email_detail: string;
  email_sent_at: string | null;
}

export interface CoachPayout {
  coach_id: string;
  coach_name: string;
  period: string;
  gross_revenue: number;
  currency: string;
  percentage: number;
  calculated_amount: number;
  paid_status: boolean;
}

/* ============ Enrolments & payments ============ */

export interface Enrollment {
  id: string;
  program_id: string;
  program_name: string;
  player_id: string;
  player_name: string;
  guardian_id: string;
  org_id: string;
  org_name: string;
  session_ids: string[];
  sessions_summary: string[];
  amount: number;
  currency: string;
  status: string;
  session_id: string | null;
  created_at: string;
  activated_at: string;
}

export interface EnrollmentResponse {
  enrollment: Enrollment;
  requires_payment: boolean;
  checkout_url?: string;
}

export interface Payment {
  id: string;
  session_id: string;
  player_id: string | null;
  player_name: string;
  guardian_id: string;
  coach_id: string | null;
  enrollment_id: string | null;
  label: string;
  lookup_key: string;
  amount: number;
  currency: string;
  kind: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface PaymentStatusResponse {
  session_id: string;
  payment_status: string;
  status: string;
  amount?: number;
  currency?: string;
}

/* ============ Public content ============ */

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  excerpt: string;
  published_on: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: "jersey" | "platinum" | "gold" | "silver" | string;
  raw_text: string;
  published_text: string;
  website: string;
  logo_url: string;
  active: boolean;
}

export interface Standing {
  id: string;
  league_name: string;
  country: string;
  team_name: string;
  logo_url: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

export interface Fixture {
  id: string;
  league_name: string;
  home_team: string;
  home_logo: string;
  away_team: string;
  away_logo: string;
  venue: string;
  kickoff: string;
}

export interface League {
  id: string;
  name: string;
  region: string;
  logo_url: string;
  partner: boolean;
}

export interface PublicSummary {
  club_name: string;
  players_registered: number;
  coaches_vetted: number;
  upcoming_events: ClubEvent[];
  programs: Program[];
  fixtures: Fixture[];
  news: NewsItem[];
  leagues: League[];
  gallery: MediaPost[];
  sponsors: Sponsor[];
  standings: Standing[];
}

/* ============ Admin ============ */

export interface AdminStats {
  players: number;
  coaches: number;
  guardians: number;
  events_upcoming: number;
  revenue_by_currency: Record<string, number>;
  pending_media: number;
  background_checks_due: number;
}

export interface RevenuePoint {
  month: string;
  total: number;
  count: number;
}

export interface AdminDashboardPlayerRow {
  player_id: string;
  player_name: string;
  team_name: string;
  org_name: string;
  guardian_name: string;
  registration_paid: boolean;
  enrollments: number;
  classes: number;
  total_paid: number;
  outstanding: number;
  currency: string;
}

export interface AdminDashboard {
  currency_totals: Record<string, number>;
  collected_total: number;
  outstanding_total: number;
  primary_currency: string;
  paid_count: number;
  pending_count: number;
  revenue_trend: RevenuePoint[];
  revenue_by_program: RevenuePoint[];
  players: AdminDashboardPlayerRow[];
}

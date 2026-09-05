export const clubInfo = {
  name: "Ooty Black Pearl FC",
  shortName: "OOTYBPFC",
  tagline: "Rise. Compete. Conquer.",
  description: "Official football club of Ooty Black Pearl - committed to excellence in Canadian professional football.",
  founded: 2020,
  location: "Toronto, Canada",
  social: { facebook: "#", twitter: "#", instagram: "#", linkedin: "#" },
};

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Fixtures", href: "#fixtures" },
  { label: "Training", href: "#training" },
  { label: "News", href: "#news" },
  { label: "Players", href: "#players" },
  { label: "League", href: "#league" },
  { label: "Contact", href: "#contact" },
];

export const fixtures = [
  { id: 1, homeTeam: "Kings United", awayTeam: "Chennaiyin FC", date: "2026-09-15", time: "19:00", venue: "Pearl Stadium", league: "Primer League", homeScore: null, awayScore: null, status: "upcoming" },
  { id: 2, homeTeam: "Mumbai City FC", awayTeam: "Nogree FC", date: "2026-09-18", time: "20:00", venue: "City Arena", league: "Primer League", homeScore: null, awayScore: null, status: "upcoming" },
  { id: 3, homeTeam: "Ooty Black Pearl FC", awayTeam: "Kings United", date: "2026-09-22", time: "18:30", venue: "Pearl Stadium", league: "Primer League", homeScore: null, awayScore: null, status: "upcoming" },
  { id: 4, homeTeam: "Chennaiyin FC", awayTeam: "Ooty Black Pearl FC", date: "2026-08-28", time: "19:00", venue: "Marina Arena", league: "Primer League", homeScore: 1, awayScore: 3, status: "completed" },
  { id: 5, homeTeam: "Ooty Black Pearl FC", awayTeam: "Mumbai City FC", date: "2026-08-21", time: "20:00", venue: "Pearl Stadium", league: "Primer League", homeScore: 2, awayScore: 2, status: "completed" },
];

export const trainingPrograms = [
  { id: 1, title: "Youth Development", ageRange: "Age 5-12", description: "Build fundamental skills, teamwork, and a love for the game.", features: ["Technical Skills", "Team Play", "Fitness Basics", "Weekly Matches"], price: 150, currency: "CAD", period: "month", icon: "star", color: "green" },
  { id: 2, title: "Elite Training", ageRange: "Age 13-18", description: "Advanced training for competitive players.", features: ["Advanced Tactics", "Strength & Conditioning", "Video Analysis", "Tournament Play"], price: 250, currency: "CAD", period: "month", icon: "trophy", color: "gold", popular: true },
  { id: 3, title: "Goalkeeper Academy", ageRange: "Age 5-18", description: "Specialized training for aspiring goalkeepers.", features: ["Shot Stopping", "Distribution", "Positioning", "Mental Toughness"], price: 200, currency: "CAD", period: "month", icon: "shield", color: "blue" },
];

export const newsArticles = [
  { id: 1, title: "OOTYBPFC Secures Dominant Victory Over Chennaiyin FC", excerpt: "A commanding 3-1 away performance showcases the squad's growing strength.", date: "2026-08-28", category: "Match Report", image: "/news-1.jpg" },
  { id: 2, title: "Youth Academy Graduates Join First Team Squad", excerpt: "Three promising talents promoted to the senior roster.", date: "2026-08-25", category: "Club News", image: "/news-2.jpg" },
  { id: 3, title: "New Training Facility Expansion Announced", excerpt: "Plans for a state-of-the-art training complex.", date: "2026-08-20", category: "Development", image: "/news-3.jpg" },
  { id: 4, title: "Season Ticket Sales Hit Record Numbers", excerpt: "Season ticket sales surpass all previous records.", date: "2026-08-15", category: "Club News", image: "/news-4.jpg" },
];

export const players = [
  { id: 1, name: "Marcus Rivera", position: "Forward", number: 9, goals: 12, assists: 8, appearances: 20, rating: 8.2, nationality: "Canada", isCaptain: false },
  { id: 2, name: "Arun Krishnan", position: "Midfielder", number: 10, goals: 7, assists: 14, appearances: 22, rating: 8.5, nationality: "India", isCaptain: true },
  { id: 3, name: "James Okafor", position: "Defender", number: 4, goals: 2, assists: 3, appearances: 21, rating: 7.8, nationality: "Nigeria", isCaptain: false },
  { id: 4, name: "Diego Santos", position: "Goalkeeper", number: 1, goals: 0, assists: 1, appearances: 22, rating: 7.9, nationality: "Brazil", isCaptain: false },
];

export const leagueTable = [
  { pos: 1, team: "Ooty Black Pearl FC", played: 22, won: 14, drawn: 5, lost: 3, gf: 42, ga: 18, gd: 24, points: 47 },
  { pos: 2, team: "Kings United", played: 22, won: 13, drawn: 4, lost: 5, gf: 38, ga: 22, gd: 16, points: 43 },
  { pos: 3, team: "Mumbai City FC", played: 22, won: 11, drawn: 6, lost: 5, gf: 35, ga: 25, gd: 10, points: 39 },
  { pos: 4, team: "Chennaiyin FC", played: 22, won: 10, drawn: 5, lost: 7, gf: 30, ga: 28, gd: 2, points: 35 },
  { pos: 5, team: "Nogree FC", played: 22, won: 8, drawn: 4, lost: 10, gf: 25, ga: 32, gd: -7, points: 28 },
  { pos: 6, team: "Coastal Rangers", played: 22, won: 5, drawn: 6, lost: 11, gf: 20, ga: 35, gd: -15, points: 21 },
];

export const clubStats = [
  { label: "Founded", value: 2020, suffix: "" },
  { label: "Matches Played", value: 156, suffix: "+" },
  { label: "Goals Scored", value: 312, suffix: "+" },
  { label: "Academy Players", value: 85, suffix: "+" },
];

export const sponsors = [
  { name: "Platinum Sponsor 1", tier: "platinum" },
  { name: "Platinum Sponsor 2", tier: "platinum" },
  { name: "Gold Sponsor 1", tier: "gold" },
  { name: "Gold Sponsor 2", tier: "gold" },
];

export const nextMatch = {
  homeTeam: "Ooty Black Pearl FC",
  awayTeam: "Kings United",
  date: "2026-09-22T18:30:00-04:00",
  venue: "Pearl Stadium",
  league: "Primer League",
};

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import Fixtures from "@/components/Fixtures";
import Countdown from "@/components/Countdown";
import TrainingPrograms from "@/components/TrainingPrograms";
import News from "@/components/News";
import PlayerSpotlight from "@/components/PlayerSpotlight";
import LeagueTable from "@/components/LeagueTable";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a1628]">
      <Header />
      <Hero />
      <StatsCounter />
      <Fixtures />
      <Countdown />
      <TrainingPrograms />
      <News />
      <PlayerSpotlight />
      <LeagueTable />
      <Sponsors />
      <Footer />
    </main>
  );
}

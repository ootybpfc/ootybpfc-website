import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Portal from "@/pages/Portal";
import Admin from "@/pages/Admin";
import Standings from "@/pages/Standings";
import Attendance from "@/pages/Attendance";
import CoachSignup from "@/pages/CoachSignup";
import CoachInvitePage from "@/pages/CoachInvite";
import { EventsPage, EventDetailPage } from "@/pages/Events";
import { RosterPage, PlayerDetailPage } from "@/pages/Roster";
import { PaymentsPage, PaymentSuccessPage, PaymentCancelPage } from "@/pages/Payments";
import { ProgramsPage, ProgramSignupPage } from "@/pages/Programs";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/coach-signup" element={<CoachSignup />} />
        <Route path="/coach-invite/:token" element={<CoachInvitePage />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path="/roster" element={<RosterPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:programId/signup" element={<ProgramSignupPage />} />
        <Route path="/register" element={<Attendance />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster position="top-center" richColors offset={{ top: "76px" }} mobileOffset={{ top: "76px" }} />
    </>
  );
}

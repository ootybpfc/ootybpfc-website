"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks, clubInfo } from "@/lib/data";
import { Menu, X, Shield } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const sections = navLinks.map((l) => l.href.replace("#", ""));
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-[#0a1628]/95 backdrop-blur-md shadow-lg shadow-black/20 py-2" : "bg-transparent py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.a href="#home" onClick={(e) => { e.preventDefault(); scrollTo("#home"); }} className="flex items-center gap-3 group" whileHover={{ scale: 1.02 }}>
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#00c853] to-[#00a844] flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-full bg-[#00c853]/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <div className="font-extrabold text-lg tracking-tight text-white leading-none">{clubInfo.shortName}</div>
              <div className="text-[10px] text-[#00c853] uppercase tracking-[0.2em] font-semibold">Est. {clubInfo.founded}</div>
            </div>
          </motion.a>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); scrollTo(link.href); }} className={`relative px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${activeSection === link.href.replace("#", "") ? "text-[#00c853]" : "text-gray-300 hover:text-white"}`}>
                {link.label}
                {activeSection === link.href.replace("#", "") && (
                  <motion.div layoutId="activeNav" className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#00c853] rounded-full" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <motion.a href="#training" onClick={(e) => { e.preventDefault(); scrollTo("#training"); }} className="hidden sm:inline-block btn-primary text-xs" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Join Now</motion.a>
            <button className="lg:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="lg:hidden bg-[#0a1628]/98 backdrop-blur-lg border-t border-white/5">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); scrollTo(link.href); }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded-lg transition-colors ${activeSection === link.href.replace("#", "") ? "text-[#00c853] bg-[#00c853]/10" : "text-gray-300 hover:text-white hover:bg-white/5"}`}>
                  {link.label}
                </motion.a>
              ))}
              <a href="#training" onClick={(e) => { e.preventDefault(); scrollTo("#training"); }} className="btn-primary text-center mt-2">Join Now</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

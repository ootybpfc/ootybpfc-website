"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { clubInfo, navLinks } from "@/lib/data";
import { Shield, Mail, MapPin, Phone, Send, ArrowUp } from "lucide-react";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>);
}
function XIcon({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>);
}
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>);
}
function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" /></svg>);
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); setTimeout(() => setSubscribed(false), 3000); }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const socialLinks = [
    { icon: FacebookIcon, href: clubInfo.social.facebook, label: "Facebook" },
    { icon: XIcon, href: clubInfo.social.twitter, label: "X / Twitter" },
    { icon: InstagramIcon, href: clubInfo.social.instagram, label: "Instagram" },
    { icon: LinkedInIcon, href: clubInfo.social.linkedin, label: "LinkedIn" },
  ];

  return (
    <footer id="contact" className="relative pt-20 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] to-[#060e1a]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00c853]/30 to-transparent" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass p-8 sm:p-12 mb-16 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Stay in the Game</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Subscribe to our newsletter for match updates, club news, and exclusive content</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00c853]/50 focus:ring-1 focus:ring-[#00c853]/25 transition-all" required />
            <motion.button type="submit" className="btn-primary flex items-center gap-2 whitespace-nowrap" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Send size={14} />{subscribed ? "Subscribed!" : "Subscribe"}
            </motion.button>
          </form>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00c853] to-[#00a844] flex items-center justify-center"><Shield size={18} className="text-white" /></div>
              <div><div className="font-extrabold text-white">{clubInfo.shortName}</div><div className="text-[9px] text-[#00c853] uppercase tracking-[0.2em]">Est. {clubInfo.founded}</div></div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{clubInfo.description}</p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }, i) => (
                <a key={i} href={href} aria-label={label} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-[#00c853] hover:bg-[#00c853]/10 transition-all duration-300" target="_blank" rel="noopener noreferrer"><Icon size={16} /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">{navLinks.map((link) => (<li key={link.href}><a href={link.href} className="text-gray-400 text-sm hover:text-[#00c853] transition-colors">{link.label}</a></li>))}</ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Club</h4>
            <ul className="space-y-2">{["About Us", "Sponsors", "Gallery", "Blog", "Board Management"].map((item) => (<li key={item}><a href="#" className="text-gray-400 text-sm hover:text-[#00c853] transition-colors">{item}</a></li>))}</ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><MapPin size={16} className="text-[#00c853] shrink-0 mt-0.5" /><span className="text-gray-400 text-sm">Toronto, Ontario, Canada</span></li>
              <li className="flex items-center gap-3"><Mail size={16} className="text-[#00c853] shrink-0" /><a href="mailto:info@ootybpfc.com" className="text-gray-400 text-sm hover:text-[#00c853] transition-colors">info@ootybpfc.com</a></li>
              <li className="flex items-center gap-3"><Phone size={16} className="text-[#00c853] shrink-0" /><span className="text-gray-400 text-sm">+1 (416) 000-0000</span></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} {clubInfo.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
      <motion.button onClick={scrollToTop} className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-[#00c853] text-white flex items-center justify-center shadow-lg shadow-[#00c853]/25 z-40 hover:bg-[#00e676] transition-colors" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <ArrowUp size={18} />
      </motion.button>
    </footer>
  );
}

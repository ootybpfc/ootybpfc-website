"use client";

import { motion } from "framer-motion";
import { newsArticles } from "@/lib/data";
import AnimatedSection from "./AnimatedSection";
import { ArrowRight, Clock } from "lucide-react";

export default function News() {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <section id="news" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f1f3d]/30 to-[#0a1628]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Latest News</h2>
            <p className="section-subtitle">Stay updated with the latest stories from Ooty Black Pearl FC</p>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <AnimatedSection delay={0.1} className="md:row-span-2">
            <motion.article className="card-glass h-full overflow-hidden group cursor-pointer" whileHover={{ y: -4 }}>
              <div className="relative h-48 sm:h-64 bg-gradient-to-br from-[#00c853]/20 to-[#0f1f3d] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 rounded-full bg-[#00c853]/10 flex items-center justify-center"><span className="text-4xl">\u26bd</span></div></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f3d] to-transparent opacity-60" />
                <div className="absolute top-4 left-4"><span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#00c853] text-white">{newsArticles[0].category}</span></div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-3"><Clock size={12} />{formatDate(newsArticles[0].date)}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00c853] transition-colors">{newsArticles[0].title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{newsArticles[0].excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-[#00c853] text-sm font-semibold group-hover:gap-3 transition-all">Read More <ArrowRight size={14} /></span>
              </div>
            </motion.article>
          </AnimatedSection>
          {newsArticles.slice(1).map((article, i) => (
            <AnimatedSection key={article.id} delay={0.15 + i * 0.1}>
              <motion.article className="card-glass overflow-hidden group cursor-pointer flex" whileHover={{ y: -4 }}>
                <div className="w-24 sm:w-32 shrink-0 bg-gradient-to-br from-[#00c853]/10 to-[#0f1f3d] flex items-center justify-center">
                  <span className="text-2xl">{article.category === "Club News" ? "\ud83d\udcf0" : article.category === "Development" ? "\ud83c\udfd7\ufe0f" : "\u26bd"}</span>
                </div>
                <div className="p-4 sm:p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 text-gray-400">{article.category}</span>
                    <span className="text-gray-500 text-[10px]">{formatDate(article.date)}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 group-hover:text-[#00c853] transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{article.excerpt}</p>
                </div>
              </motion.article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { Camera, RefreshCw, Check, Sparkles, Shield, Database, Radio } from "lucide-react";

interface NavbarProps {
  onOpenSnapModal: () => void;
  onSeedSuccess?: () => void;
  reunitedCount?: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  onOpenSnapModal,
  onSeedSuccess,
  reunitedCount = 14,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/demo/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
        if (onSeedSuccess) onSeedSuccess();
      }
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div
          className="flex items-center gap-3.5 cursor-pointer"
          onClick={() => setActiveTab("browse")}
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-transparent border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Snap<span className="text-emerald-400">Found</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                CAMPUS RADAR
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Zero-Typing AI Lost &amp; Found
            </span>
          </div>
        </div>

        {/* Center: Quick Live Stats Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-850/80 border border-white/[0.06] shadow-inner text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-300">
            <strong className="text-white">{reunitedCount} Items</strong> Reunited on Campus Today
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Subtle 1-Click Demo Seed */}
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            title="Seed 6 realistic campus found items with 768-dim embeddings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
              seedSuccess
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-dark-850 text-cyan-400 hover:bg-dark-800 border-cyan-500/20 hover:border-cyan-500/40"
            }`}
          >
            {isSeeding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : seedSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Database className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">
              {isSeeding ? "Seeding..." : seedSuccess ? "Demo Seeded!" : "Seed Demo Data"}
            </span>
          </button>

          {/* Primary Action Button: + Snap Found Item */}
          <button
            onClick={onOpenSnapModal}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-dark-950 font-display font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Camera className="w-4 h-4 text-dark-950 stroke-[2.5]" />
            <span>Snap Found Item</span>
          </button>

          {/* User Profile Avatar */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
            <img
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOcrmupkqzG4pOml8p3vKt4Ze6IUgAu2Jazhv9HDbsA2u5urkMjLZROE3NfBXSGyYk4VVr_9NQ1JqT7Ml6B5NQZ3NfLRnCo82qAY4LdOrsiNaTrATJMZ2a3gyXro9yH6i7XxpXhhL7gTpO-ssxaP8yOrMK_EDQCS-6Yr1M49QSQrx2nKm3jGUZsg0mc-r4GSdLqEk3myUvQccUZEiWvmtVI4nYgVhCFgqGO86qOxw"
            />
          </div>
        </div>
      </div>
    </header>
  );
}


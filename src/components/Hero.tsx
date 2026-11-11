"use client";

import React from "react";
import { ShieldCheck, Zap, Sparkles, Clock, Compass } from "lucide-react";

interface HeroProps {
  totalItems: number;
}

export default function Hero({ totalItems = 48 }: HeroProps) {
  return (
    <section className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Background Ambient Glow Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full"></div>

      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
        {/* Chip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Gemini 2.5 Flash + Supabase pgvector</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Snap what you found. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
            Reunited in seconds without typing.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          Found something on campus? Take one quick photo. Our AI vision extracts descriptive traits, isolates a secret identifying feature to defeat false claims, and matches true owners via natural language search.
        </p>
      </div>

      {/* 4 Clean Glass Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10">
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase font-semibold">Live Scope</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {totalItems}
            </span>
            <span className="text-xs text-slate-400 font-medium">Assets Tracked</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Active across 6 campus sectors</span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase font-semibold">Anti-Theft Shield</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              99.4%
            </span>
            <span className="text-xs text-emerald-400 font-medium">Accuracy</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Zero-Knowledge masked detail</span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase font-semibold">Recovery Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-cyan-400">
              3.2m
            </span>
            <span className="text-xs text-slate-400 font-medium">Avg Handover</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Rapid peer or desk handover</span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase font-semibold">Vector Index</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              768-D
            </span>
            <span className="text-xs text-slate-400 font-medium">Embeddings</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Semantic natural language query</span>
        </div>
      </div>
    </section>
  );
}


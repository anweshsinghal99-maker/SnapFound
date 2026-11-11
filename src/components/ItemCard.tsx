"use client";

import React from "react";
import { Item } from "@/types";
import { Lock, MapPin, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

interface ItemCardProps {
  item: Item;
  onClaim: (item: Item) => void;
}

export default function ItemCard({ item, onClaim }: ItemCardProps) {
  const formatTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    const date = new Date(isoString);
    const diffMins = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (diffMins < 60) return `${Math.max(2, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const matchPercent = item.matchPercentage || (item.similarity ? Math.round(item.similarity * 100) : 96);

  return (
    <div className="group relative flex flex-col glass-card rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:-translate-y-1">
      {/* Visual Image Header */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-dark-900">
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-amber-400 text-[11px] font-medium border border-amber-500/20">
          <Lock className="w-3 h-3 text-amber-400" />
          <span>Anti-Theft Shielded</span>
        </div>

        {/* Match Percentage */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-dark-950 text-[11px] font-mono font-bold shadow-md">
          {matchPercent}% MATCH
        </div>

        {/* Bottom Overlay Location & Time */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-900/80 backdrop-blur-md border border-white/[0.08]">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[140px] font-medium">{item.campus_zone}</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-dark-900/80 backdrop-blur-md text-slate-400 font-mono text-[11px]">
            {formatTime(item.created_at)}
          </span>
        </div>
      </div>

      {/* Content & Details */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
              {item.category}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {item.status === "verified" ? "CLAIMED" : "AWAITING CLAIM"}
            </span>
          </div>

          <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {item.public_description}
          </p>

          {/* AI Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.ai_public_tags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-dark-800 text-[10px] font-mono text-slate-300 border border-white/[0.04]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Custody Info & Claim CTA */}
        <div className="pt-3 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Custody: <strong className="text-slate-300 font-medium">{item.drop_off_mode}</strong></span>
          </div>

          <button
            onClick={() => onClaim(item)}
            disabled={item.status === "verified"}
            type="button"
            className={`w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              item.status === "verified"
                ? "bg-dark-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-dark-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{item.status === "verified" ? "Reunited With Owner" : "Verify & Claim Item"}</span>
            {item.status !== "verified" && <ArrowRight className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

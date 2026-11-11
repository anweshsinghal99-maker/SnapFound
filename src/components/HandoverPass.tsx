"use client";

import React, { useEffect, useState } from "react";
import { Item, VerificationResult } from "@/types";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Clock,
  MapPin,
  User,
  Check,
  Sparkles,
  ArrowLeft,
  QrCode,
} from "lucide-react";
import confetti from "canvas-confetti";

interface HandoverPassProps {
  item: Item;
  verificationResult?: VerificationResult | null;
  onBackToDiscovery: () => void;
}

export default function HandoverPass({
  item,
  verificationResult,
  onBackToDiscovery,
}: HandoverPassProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(3600);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10B981", "#06B6D4", "#F59E0B"],
      });
    } catch (e) {
      // safe fallback
    }

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const pin = verificationResult?.handover_pin || item.handover_pin || "4829";
  const pinDigits = pin.padStart(4, "0").split("").slice(0, 4);

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const confidenceScore = verificationResult?.confidence_score
    ? Math.round(verificationResult.confidence_score * 100)
    : 98;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Back button */}
      <div>
        <button
          onClick={onBackToDiscovery}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-dark-850 text-xs text-slate-300 hover:text-white hover:bg-dark-800 transition-colors border border-white/[0.06]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Feed</span>
        </button>
      </div>

      {/* 1. Celebration Header */}
      <section className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cryptographic Match Proof · Zero-Knowledge Validated</span>
        </div>

        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <h1 className="font-display text-2xl sm:text-4xl text-white font-extrabold tracking-tight">
              Ownership Verified by AI{" "}
              <span className="text-emerald-400 font-mono text-xl sm:text-3xl">
                ({confidenceScore}%)
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Ground-truth confirmation:{" "}
            <span className="text-white font-semibold bg-dark-850 px-2 py-0.5 rounded border border-white/[0.08]">
              "{verificationResult?.item?.secret_detail || item.secret_detail || "Protected security feature"}"
            </span>{" "}
            matched your claim submission.
          </p>
        </div>
      </section>

      {/* 2. Digital Handover Ticket Pass */}
      <section className="w-full relative">
        <div className="relative glass-panel rounded-3xl border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden">
          {/* Header Banner */}
          <div className="bg-dark-900/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]"></span>
              <span className="font-mono text-xs tracking-wider text-slate-300 uppercase font-bold">
                OFFICIAL AUTHORIZED RETRIEVAL PASS
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>SECURITY CERTIFIED</span>
            </div>
          </div>

          {/* Top Section: Item Summary */}
          <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Unblurred Image */}
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden aspect-square bg-dark-900 border border-white/[0.08] shadow-inner">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-dark-950/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>UNMASKED EVIDENCE</span>
              </div>
            </div>

            {/* Metadata & Spec */}
            <div className="md:col-span-8 flex flex-col justify-between h-full gap-4">
              <div className="space-y-1.5">
                <span className="font-mono text-xs text-cyan-400">
                  [TAG: #{item.id?.substring(0, 8) || "SF-8842"}]
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  {item.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    Custody Location:{" "}
                    <strong className="text-white">{item.campus_zone}</strong> ·{" "}
                    <span className="text-cyan-400">{item.drop_off_mode}</span>
                  </span>
                </p>
              </div>

              {/* Recipient / Finder Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-dark-850 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Recipient (You)</span>
                  </div>
                  <div className="font-display font-bold text-white text-sm">Alex Rivera</div>
                  <div className="font-mono text-[11px] text-slate-400">
                    CS Dept · #2024-CS-8921
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-dark-850 border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Found By</span>
                  </div>
                  <div className="font-display font-bold text-white text-sm">
                    {item.finder_contact || "@campus_good_samaritan"}
                  </div>
                  <div className="font-mono text-[11px] text-emerald-400">
                    Good Samaritan Verified
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PERFORATED TICKET NOTCHES */}
          <div className="relative w-full flex items-center justify-between py-2">
            <div className="w-6 h-12 bg-dark-950 rounded-r-full -ml-3 shadow-inner border-r border-white/[0.08]"></div>
            <div className="flex-1 mx-4 border-b-2 border-dashed border-white/[0.1] flex items-center justify-center">
              <span className="bg-dark-900 px-4 py-0.5 rounded-full font-mono text-[10px] text-slate-500 uppercase tracking-widest -mb-3 border border-white/[0.06]">
                CRYPTOGRAPHIC RETRIEVAL SEGMENT
              </span>
            </div>
            <div className="w-6 h-12 bg-dark-950 rounded-l-full -mr-3 shadow-inner border-l border-white/[0.08]"></div>
          </div>

          {/* PIN Matrix & QR Code */}
          <div className="p-6 lg:p-8 bg-dark-900/60 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* 4-Digit Segmented Monospace PIN */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Authorized Handover PIN
                  </span>
                  <span className="font-mono text-[11px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Valid: {formatCountdown(countdown)}</span>
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {pinDigits.map((digit, i) => (
                    <div
                      key={i}
                      className="h-24 sm:h-28 rounded-2xl bg-dark-850 border-2 border-emerald-500/40 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105"
                    >
                      <span className="font-mono text-4xl sm:text-5xl font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                        {digit}
                      </span>
                      <span className="font-mono text-[9px] text-slate-500 tracking-widest mt-1">
                        DIGIT 0{i + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">
                    Whisper this code at the custody desk or type on smart locker keypad.
                  </span>
                  <button
                    onClick={handleCopyPin}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-xs font-mono text-emerald-400 border border-emerald-500/30 transition-all shrink-0 ml-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied PIN" : "Copy PIN"}</span>
                  </button>
                </div>
              </div>

              {/* QR Code Presentation */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-dark-850 border border-white/[0.06] text-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                  <svg className="w-28 h-28" viewBox="0 0 100 100" fill="black">
                    <rect width="100" height="100" fill="white" />
                    <rect x="5" y="5" width="28" height="28" fill="black" />
                    <rect x="9" y="9" width="20" height="20" fill="white" />
                    <rect x="13" y="13" width="12" height="12" fill="black" />

                    <rect x="67" y="5" width="28" height="28" fill="black" />
                    <rect x="71" y="9" width="20" height="20" fill="white" />
                    <rect x="75" y="13" width="12" height="12" fill="black" />

                    <rect x="5" y="67" width="28" height="28" fill="black" />
                    <rect x="9" y="71" width="20" height="20" fill="white" />
                    <rect x="13" y="75" width="12" height="12" fill="black" />

                    <rect x="38" y="10" width="8" height="8" fill="black" />
                    <rect x="50" y="15" width="8" height="8" fill="black" />
                    <rect x="38" y="25" width="8" height="8" fill="black" />
                    <rect x="10" y="38" width="8" height="8" fill="black" />
                    <rect x="25" y="45" width="8" height="8" fill="black" />
                    <rect x="40" y="40" width="20" height="20" fill="black" />
                    <rect x="67" y="38" width="8" height="8" fill="black" />
                    <rect x="80" y="50" width="8" height="8" fill="black" />
                    <rect x="38" y="67" width="8" height="8" fill="black" />
                    <rect x="52" y="75" width="8" height="8" fill="black" />
                    <rect x="72" y="72" width="16" height="16" fill="black" />
                  </svg>
                </div>

                <div className="space-y-0.5">
                  <div className="font-mono text-[11px] text-cyan-400 uppercase font-bold tracking-wider">
                    SCAN AT CUSTODY DESK
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {item.drop_off_mode} ({item.campus_zone})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Item, VerificationResult } from "@/types";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Sparkles,
  HelpCircle,
  X,
  AlertTriangle,
  RefreshCw,
  Zap,
  MapPin,
  Clock,
  UserCheck,
} from "lucide-react";

interface VerifyModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onVerifiedSuccess: (result: VerificationResult) => void;
}

export default function VerifyModal({
  item,
  isOpen,
  onClose,
  onVerifiedSuccess,
}: VerifyModalProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalProgress, setEvalProgress] = useState(0);
  const [evalLogs, setEvalLogs] = useState<string[]>([]);
  const [evalError, setEvalError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  if (!isOpen || !item) return null;

  // Pre-fill smart sample answer for testing
  const handleSampleAnswer = () => {
    if (item.title.toLowerCase().includes("flask")) {
      setUserAnswer("There is a red Spider-Man sticker on the bottom base with slight edge peeling.");
    } else if (item.title.toLowerCase().includes("calculator")) {
      setUserAnswer("My roll number 2024-EE-104 and blue signature is written inside the sliding case.");
    } else if (item.title.toLowerCase().includes("id") || item.title.toLowerCase().includes("lanyard")) {
      setUserAnswer("A small green rubber Yoda keychain is attached next to the keys.");
    } else if (item.title.toLowerCase().includes("airpod")) {
      setUserAnswer("It has a black replacement silicone ear tip size Large.");
    } else if (item.title.toLowerCase().includes("racquet")) {
      setUserAnswer("Red grip tape is wrapped tightly around the main zipper pull tab.");
    } else {
      setUserAnswer("It has unique handwritten initials and a custom sticker on the lower rear panel.");
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      setEvalError("Please provide a descriptive answer to prove ownership.");
      return;
    }

    setIsEvaluating(true);
    setEvalError("");
    setEvalProgress(20);
    setEvalLogs([
      "> Ingesting student claimant response vector... [OK]",
      "> Fetching encrypted ground-truth feature from vault... [LOCKED]",
    ]);

    setTimeout(() => {
      setEvalProgress(55);
      setEvalLogs((prev) => [
        ...prev,
        "> Activating Gemini 2.5 Flash Anti-Theft Verification Judge...",
        "> Comparing semantic equivalence against isolated ground truth...",
      ]);
    }, 600);

    setTimeout(() => {
      setEvalProgress(85);
      setEvalLogs((prev) => [
        ...prev,
        "> Evaluating semantic similarity and specific knowledge...",
      ]);
    }, 1200);

    try {
      const res = await fetch("/api/items/verify-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          user_answer: userAnswer,
          claimant_name: "Alex Rivera",
        }),
      });

      const data = await res.json();
      setEvalProgress(100);

      if (data.verified) {
        setEvalLogs((prev) => [
          ...prev,
          `> VERIFIED: TRUE (Confidence: ${Math.round(data.confidence_score * 100)}%)`,
          "> Generating Cryptographic Handover Pass & Authorized PIN...",
        ]);

        setTimeout(() => {
          setIsEvaluating(false);
          onVerifiedSuccess(data);
          onClose();
        }, 1000);
      } else {
        setIsEvaluating(false);
        setAttemptsRemaining((prev) => Math.max(0, prev - 1));
        setEvalError(
          data.feedback_message ||
            "Verification rejected. The description does not match the protected ground truth."
        );
      }
    } catch (err: any) {
      setIsEvaluating(false);
      setEvalError(err.message || "Network error while evaluating verification.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-950/85 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden my-auto">
        {/* Anti-Theft Header */}
        <div className="p-4 sm:p-5 bg-dark-900/70 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-bold text-white">
                  Ownership Verification Challenge
                </h3>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  Gemini 2.5 Flash Judge
                </span>
              </div>
              <p className="text-xs text-slate-400">
                To prevent false claims, our AI has masked 1 secret ground-truth identifier.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Masked Image & Metadata (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-dark-900 border border-white/[0.08] shadow-md">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Privacy Masking Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 backdrop-blur-md bg-dark-950/80 border-t border-white/[0.08] flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-8 h-8 rounded-full bg-dark-850 flex items-center justify-center text-amber-400 mb-1 border border-amber-500/30">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                    Masked Identifier
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Protected ground-truth attribute
                  </span>
                </div>

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-cyan-400 font-mono text-[10px] border border-cyan-500/30">
                  ZONE: {item.campus_zone}
                </div>
              </div>

              {/* Item Info Box */}
              <div className="p-4 rounded-xl bg-dark-850 border border-white/[0.06] space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <h4 className="font-display font-bold text-white text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Awaiting Claim
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-400 pt-1 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Sector
                    </span>
                    <span className="text-white font-medium">{item.campus_zone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Custody
                    </span>
                    <span className="text-emerald-400 font-medium">{item.drop_off_mode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Challenge & Claim Response (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Challenge Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-dark-850 border border-cyan-500/30 shadow-lg space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Ground-Truth Challenge</span>
                </div>

                <div className="p-3.5 rounded-xl bg-dark-900 border border-white/[0.06] text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  "{item.verification_question || "Please describe the specific distinguishing sticker, engraving, or defect on this item."}"
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Gemini AI checks semantic meaning and allows natural phrasing.</span>
                </p>
              </div>

              {/* Textarea Proof Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-mono text-slate-300 uppercase font-bold text-[11px]">
                    Your Descriptive Proof
                  </label>
                  <button
                    type="button"
                    onClick={handleSampleAnswer}
                    className="font-mono text-cyan-400 hover:text-cyan-300 text-[11px] underline cursor-pointer"
                  >
                    ⚡ Try Demo Answer (Judge Demo)
                  </button>
                </div>

                <div className="relative rounded-xl bg-dark-900 border border-white/[0.08] focus-within:border-emerald-500/50 transition-all">
                  <textarea
                    rows={4}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder='e.g., "There is a red Spider-Man sticker on the bottom base with slight scratch on the left corner."'
                    className="w-full resize-none bg-transparent p-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  ></textarea>
                  <div className="px-3.5 pb-2 flex justify-end text-[10px] font-mono text-slate-500">
                    {userAnswer.length}/240
                  </div>
                </div>
              </div>

              {/* Claimant Student Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-white/[0.06] text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    alt="Alex Rivera"
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOcrmupkqzG4pOml8p3vKt4Ze6IUgAu2Jazhv9HDbsA2u5urkMjLZROE3NfBXSGyYk4VVr_9NQ1JqT7Ml6B5NQZ3NfLRnCo82qAY4LdOrsiNaTrATJMZ2a3gyXro9yH6i7XxpXhhL7gTpO-ssxaP8yOrMK_EDQCS-6Yr1M49QSQrx2nKm3jGUZsg0mc-r4GSdLqEk3myUvQccUZEiWvmtVI4nYgVhCFgqGO86qOxw"
                  />
                  <div>
                    <span className="font-bold text-white">Alex Rivera</span>
                    <span className="font-mono text-[10px] text-emerald-400 ml-2">
                      CS Dept · #2024-CS-8921
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>ID VERIFIED</span>
                </div>
              </div>

              {/* Error Message */}
              {evalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Verification Failed</strong>
                    <span>{evalError}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-dark-950 font-display font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {isEvaluating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-dark-950" />
                  ) : (
                    <Zap className="w-4 h-4 text-dark-950 stroke-[2.5]" />
                  )}
                  <span>
                    {isEvaluating ? "Evaluating with Gemini AI..." : "Verify Ownership with Gemini AI"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-dark-850 text-slate-300 hover:text-white hover:bg-dark-800 text-xs font-semibold border border-white/[0.06]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Evaluation Overlay */}
          {isEvaluating && (
            <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-2xl rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="max-w-md w-full flex flex-col items-center gap-4">
                <div className="relative h-16 w-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-dark-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-cyan-400 tracking-widest uppercase">
                    Cross-Referencing Telemetry
                  </span>
                  <h3 className="font-display text-base font-bold text-white">
                    Gemini Multi-Modal Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparing semantic description with unmasked visual features...
                  </p>
                </div>

                <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${evalProgress}%` }}
                  ></div>
                </div>

                <div className="w-full rounded-xl bg-dark-900 p-3 text-left font-mono text-[11px] text-slate-400 space-y-1 border border-white/[0.06]">
                  {evalLogs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes("TRUE") || log.includes("OK")
                          ? "text-emerald-400 font-bold"
                          : log.includes("Gemini")
                          ? "text-cyan-400"
                          : ""
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


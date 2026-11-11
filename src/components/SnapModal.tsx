"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  MapPin,
  ShieldCheck,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  EyeOff,
} from "lucide-react";
import { Item } from "@/types";

interface SnapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: Item) => void;
}

export default function SnapModal({ isOpen, onClose, onItemCreated }: SnapModalProps) {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [campusZone, setCampusZone] = useState("Main Library 2F");
  const [custodyMode, setCustodyMode] = useState("Security Desk (Desk #1)");
  const [finderContact, setFinderContact] = useState("@alex_mit");

  // Telemetry stages
  const [isProcessing, setIsProcessing] = useState(false);
  const [telemetryStep, setTelemetryStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === "camera" && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, capturedImage]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      setMode("upload");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
        runAnalysis(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        runAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imgBase64: string) => {
    setIsProcessing(true);
    setErrorMessage("");
    setTelemetryStep(1);

    const t1 = setTimeout(() => setTelemetryStep(2), 1200);
    const t2 = setTimeout(() => setTelemetryStep(3), 2400);

    try {
      const res = await fetch("/api/items/analyze-and-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imgBase64,
          campus_zone: campusZone,
          drop_off_mode: custodyMode,
          finder_contact: finderContact,
        }),
      });

      const data = await res.json();
      clearTimeout(t1);
      clearTimeout(t2);

      if (!res.ok || data.error) {
        throw new Error(data.error || "Analysis failed");
      }

      setTelemetryStep(4);
      setAnalysisResult(data);
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      console.error("Analysis pipeline error:", err);
      setErrorMessage(err.message || "Failed to process image");
      setIsProcessing(false);
    }
  };

  const handleDone = () => {
    if (analysisResult?.item) {
      onItemCreated(analysisResult.item);
    }
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsProcessing(false);
    setTelemetryStep(0);
    setErrorMessage("");
    if (mode === "camera") {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-950/85 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-dark-900/60 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white">
                Snap &amp; Drop: Zero-Typing Report
              </h3>
              <p className="text-xs text-slate-400">
                AI extracts attributes and locks anti-theft proof in 3 seconds
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Step Progress Pills */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                telemetryStep >= 1
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-dark-850 border-white/[0.04] text-slate-400"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-dark-950 flex items-center justify-center font-mono text-[10px] font-bold">
                1
              </div>
              <span className="text-xs font-semibold truncate">Snap &amp; Sector</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                telemetryStep >= 2
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                  : "bg-dark-850 border-white/[0.04] text-slate-400"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500 text-dark-950 flex items-center justify-center font-mono text-[10px] font-bold">
                2
              </div>
              <span className="text-xs font-semibold truncate">Gemini Vision</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                telemetryStep >= 3
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-dark-850 border-white/[0.04] text-slate-400"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-dark-950 flex items-center justify-center font-mono text-[10px] font-bold">
                3
              </div>
              <span className="text-xs font-semibold truncate">Anti-Theft Shield</span>
            </div>
          </div>

          {/* Viewfinder / Upload Area */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-dark-900 border border-white/[0.08] shadow-inner">
            {!capturedImage ? (
              mode === "camera" ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Framing brackets */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400 pointer-events-none"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400 pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400 pointer-events-none"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400 pointer-events-none"></div>

                  {/* Scanning sweep laser */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22D3EE] animate-scan pointer-events-none"></div>

                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
                    Live Optical Sensor
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer border-2 border-dashed border-white/[0.1] hover:border-emerald-500/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-dark-850 flex items-center justify-center text-emerald-400 border border-white/[0.06]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Click to upload photo of found item</p>
                    <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, WEBP from your device</p>
                  </div>
                </div>
              )
            ) : (
              <div className="relative w-full h-full">
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                    <span className="font-mono text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                      {telemetryStep === 1 && "1. Analyzing Visual Attributes with Gemini Vision..."}
                      {telemetryStep === 2 && "2. Isolating Anti-Theft Security Feature..."}
                      {telemetryStep === 3 && "3. Generating 768-Dim Vector Embedding..."}
                      {telemetryStep === 4 && "Analysis Complete!"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Capture Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "camera" ? "upload" : "camera");
                  setCapturedImage(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5"
              >
                {mode === "camera" ? <Upload className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                <span>{mode === "camera" ? "Upload File" : "Live Camera"}</span>
              </button>

              {capturedImage && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              )}
            </div>

            {!capturedImage && mode === "camera" && (
              <button
                type="button"
                onClick={takePhoto}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-display font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-dark-950 stroke-[2.5]" />
                <span>Snap Photo</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* 1-Tap Campus Location & Custody */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Campus Location (1-Tap)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Main Library 2F",
                  "LT-102 Row G",
                  "Hostel F Mess",
                  "Indoor Badminton Court",
                  "Engineering Hall",
                ].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setCampusZone(z)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      campusZone === z
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                        : "bg-dark-850 text-slate-400 hover:text-white border border-white/[0.04]"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Physical Custody</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Security Desk (Desk #1)",
                  "Smart Locker B-12",
                  "Hostel Warden Office",
                  "With Finder (@alex_mit)",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustodyMode(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      custodyMode === c
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                        : "bg-dark-850 text-slate-400 hover:text-white border border-white/[0.04]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Extraction Preview Card (when analysis completes) */}
          {analysisResult && (
            <div className="p-4 rounded-2xl bg-dark-900 border border-emerald-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Gemini Vision Analysis Complete
                </span>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  768-D EMBEDDED
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Identified Item: </span>
                  <strong className="text-white">{analysisResult.item?.title}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Public Description: </span>
                  <span className="text-slate-300 italic">"{analysisResult.item?.public_description}"</span>
                </div>

                <div className="p-3 rounded-xl bg-dark-950 border border-amber-500/30 space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>ANTI-THEFT CHALLENGE QUESTION</span>
                  </div>
                  <p className="text-white text-xs font-medium">
                    "{analysisResult.item?.verification_question}"
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                    <EyeOff className="w-3 h-3 text-amber-400" />
                    <span>Secret distinguishing feature withheld from public view.</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDone}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-dark-950 font-display font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Publish to Campus Radar</span>
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

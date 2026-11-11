"use client";

import React, { useRef } from "react";
import { Search, Mic, Camera, ArrowRight, X, Sparkles, MapPin } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearch: (e?: React.FormEvent) => void;
  isSearching: boolean;
  selectedZone: string;
  setSelectedZone: (z: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  onImageSearchTrigger?: (file: File) => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
  selectedZone,
  setSelectedZone,
  selectedCategory,
  setSelectedCategory,
  onImageSearchTrigger,
}: SearchBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const zones = [
    { id: "all", label: "All Sectors" },
    { id: "Main Library", label: "Central Library" },
    { id: "LT-102", label: "Lecture Hall LT-102" },
    { id: "Hostel", label: "Hostel Mess" },
    { id: "Badminton", label: "Sports Complex" },
  ];

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "Bottles & Gear", label: "Bottles & Flasks" },
    { id: "Books & Calculators", label: "Calculators & Books" },
    { id: "Electronics", label: "Electronics" },
    { id: "ID & Keys", label: "IDs & Keys" },
    { id: "Accessories", label: "Accessories" },
  ];

  const quickQueries = [
    "black water bottle near library",
    "Casio scientific calculator",
    "AirPod Pro",
    "student ID lanyard",
  ];

  const handleVoiceInput = () => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
      recognition.start();
    } else {
      setSearchQuery("black water bottle near library");
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Search Input Bar */}
      <form onSubmit={onSearch} className="relative w-full">
        <div className="relative rounded-2xl glass-panel p-2 shadow-2xl border border-white/[0.08] focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
          <div className="flex items-center gap-3 px-2 sm:px-3">
            <Search className="w-5 h-5 text-emerald-400 shrink-0" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe what you lost in natural language (e.g. 'black hydro flask near library')..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none py-2.5"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/[0.08]">
              {/* Voice Trigger */}
              <button
                type="button"
                onClick={handleVoiceInput}
                title="Voice Search"
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-white/[0.05] transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Photo Search Trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onImageSearchTrigger) onImageSearchTrigger(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Search by Photo"
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Search Submit Button */}
              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-display font-bold text-xs sm:text-sm shadow-md transition-all ml-1"
              >
                <span>{isSearching ? "Searching..." : "Search"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Quick Judge Sample Queries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="font-mono text-[11px] text-slate-400 uppercase shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Demo:
        </span>
        {quickQueries.map((query) => (
          <button
            key={query}
            type="button"
            onClick={() => {
              setSearchQuery(query);
            }}
            className="px-3 py-1 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-white/[0.06] whitespace-nowrap text-xs transition-colors"
          >
            "{query}"
          </button>
        ))}
      </div>

      {/* Dual Filter Pills (Zones & Categories) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Campus Zone Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="font-mono text-[11px] text-slate-400 uppercase mr-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" /> Sector:
          </span>
          {zones.map((z) => {
            const isSelected = selectedZone === z.id || (z.id === "all" && (selectedZone === "" || selectedZone === "all"));
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZone(z.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "bg-dark-850 text-slate-400 hover:text-slate-200 border border-white/[0.04]"
                }`}
              >
                {z.label}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id || (c.id === "all" && (selectedCategory === "" || selectedCategory === "all"));
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "bg-dark-850 text-slate-400 hover:text-slate-200 border border-white/[0.04]"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}


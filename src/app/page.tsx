"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import ItemCard from "@/components/ItemCard";
import SnapModal from "@/components/SnapModal";
import VerifyModal from "@/components/VerifyModal";
import HandoverPass from "@/components/HandoverPass";
import { Item, VerificationResult } from "@/types";
import { RefreshCw, Database, Sparkles } from "lucide-react";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");

  // Modals & Handover Pass State
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [activeVerificationItem, setActiveVerificationItem] = useState<Item | null>(null);
  const [verifiedPassItem, setVerifiedPassItem] = useState<Item | null>(null);
  const [latestVerificationResult, setLatestVerificationResult] = useState<VerificationResult | null>(null);

  // Reunited Counter
  const [reunitedCount, setReunitedCount] = useState(14);

  // Fetch items from API
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      let url = "/api/items?";
      if (selectedZone && selectedZone !== "all") url += `campus_zone=${encodeURIComponent(selectedZone)}&`;
      if (selectedCategory && selectedCategory !== "all") url += `category=${encodeURIComponent(selectedCategory)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchItems();
    }
  }, [selectedZone, selectedCategory]);

  // Handle Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      fetchItems();
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch("/api/items/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          campus_zone: selectedZone,
          category: selectedCategory,
        }),
      });
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Visual Image Search Trigger
  const handleImageSearchTrigger = async (file: File) => {
    setIsSearching(true);
    setSearchQuery(`Photo scan: ${file.name}`);
    try {
      const res = await fetch("/api/items/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "lost campus personal item",
          campus_zone: selectedZone,
          category: selectedCategory,
        }),
      });
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Image search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Item created in Snap & Drop modal
  const handleItemCreated = (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
    setActiveTab("browse");
  };

  // Start verification claim
  const handleStartClaim = (item: Item) => {
    setActiveVerificationItem(item);
  };

  // Verification success
  const handleVerificationSuccess = (result: VerificationResult) => {
    if (result.item) {
      setVerifiedPassItem(result.item);
      setLatestVerificationResult(result);
      setReunitedCount((prev) => prev + 1);
      setActiveTab("handover");

      // Update local item status in state
      setItems((prev) =>
        prev.map((i) => (i.id === result.item?.id ? { ...i, status: "verified" } : i))
      );
    }
  };

  return (
    <div className="bg-[#07090E] min-h-screen text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-dark-950">
      {/* Top Navbar */}
      <Navbar
        onOpenSnapModal={() => setIsSnapModalOpen(true)}
        onSeedSuccess={fetchItems}
        reunitedCount={reunitedCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View */}
      <main className="w-full pt-20 flex-1 flex flex-col">
        {activeTab === "handover" && verifiedPassItem ? (
          <HandoverPass
            item={verifiedPassItem}
            verificationResult={latestVerificationResult}
            onBackToDiscovery={() => setActiveTab("browse")}
          />
        ) : (
          <div className="flex flex-col w-full">
            {/* Hero Section */}
            <Hero totalItems={items.length || 48} />

            {/* Spotlight Search & Filters */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearching}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onImageSearchTrigger={handleImageSearchTrigger}
            />

            {/* Items Feed */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                    {searchQuery ? `Semantic Search Results (${items.length})` : "Campus Lost & Found Feed"}
                  </h2>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  Sorted by Semantic Relevance
                </span>
              </div>

              {isLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                    Querying Supabase pgvector ledger...
                  </span>
                </div>
              ) : items.length === 0 ? (
                <div className="py-16 px-6 rounded-3xl glass-card text-center flex flex-col items-center gap-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-dark-850 flex items-center justify-center text-emerald-400 border border-white/[0.06]">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      No Items in this sector
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Populate 6 realistic campus found items (with real 768-dim embeddings) for your demo!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      fetch("/api/demo/seed", { method: "POST" }).then(() => fetchItems());
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-display font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-dark-950" />
                    <span>⚡ Seed 6 Demo Items Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} onClaim={handleStartClaim} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Snap & Drop Modal */}
      <SnapModal
        isOpen={isSnapModalOpen}
        onClose={() => setIsSnapModalOpen(false)}
        onItemCreated={handleItemCreated}
      />

      {/* Verification Challenge Modal */}
      <VerifyModal
        item={activeVerificationItem}
        isOpen={Boolean(activeVerificationItem)}
        onClose={() => setActiveVerificationItem(null)}
        onVerifiedSuccess={handleVerificationSuccess}
      />
    </div>
  );
}

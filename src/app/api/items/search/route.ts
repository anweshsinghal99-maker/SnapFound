import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { query, campus_zone, category } = await req.json();

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // 1. Generate 768-dim embedding for user's natural language query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Call Supabase match_items RPC
    const { data: rpcMatches, error: rpcError } = await supabaseAdmin.rpc("match_items", {
      query_embedding: queryEmbedding,
      match_threshold: 0.25,
      match_count: 12,
    });

    let items = rpcMatches || [];

    // Fallback: If RPC had an error or 0 matches, perform an ILIKE search
    if (rpcError || items.length === 0) {
      console.warn("RPC match_items returned 0 or error, applying text fallback:", rpcError?.message);
      let queryBuilder = supabaseAdmin
        .from("items")
        .select("id, created_at, title, category, image_url, campus_zone, drop_off_mode, finder_contact, ai_public_tags, public_description, verification_question, status")
        .order("created_at", { ascending: false })
        .limit(12);

      const searchTerms = query.trim().split(/\s+/).filter((t: string) => t.length > 2);
      if (searchTerms.length > 0) {
        const orClauses = searchTerms
          .map((term: string) => `title.ilike.%${term}%,public_description.ilike.%${term}%,category.ilike.%${term}%`)
          .join(",");
        queryBuilder = queryBuilder.or(orClauses);
      }

      if (campus_zone && campus_zone !== "all") {
        queryBuilder = queryBuilder.ilike("campus_zone", `%${campus_zone}%`);
      }
      if (category && category !== "all") {
        queryBuilder = queryBuilder.ilike("category", `%${category}%`);
      }

      const { data: textResults } = await queryBuilder;
      if (textResults) {
        items = textResults.map((item, idx) => ({
          ...item,
          similarity: Math.max(0.65, 0.95 - idx * 0.05),
        }));
      }
    }

    // Filter by campus zone & category if requested
    if (campus_zone && campus_zone !== "all") {
      items = items.filter((item: any) =>
        item.campus_zone?.toLowerCase().includes(campus_zone.toLowerCase())
      );
    }
    if (category && category !== "all") {
      items = items.filter((item: any) =>
        item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Format with percentage match score and ensure secret_detail and handover_pin are never exposed
    const sanitizedItems = items.map((item: any) => {
      const similarity = typeof item.similarity === "number" ? item.similarity : 0.85;
      const matchPercentage = Math.min(99, Math.max(50, Math.round(similarity * 100)));
      const { secret_detail, handover_pin, ...safeItem } = item;
      return {
        ...safeItem,
        similarity,
        matchPercentage,
      };
    });

    return NextResponse.json({
      success: true,
      items: sanitizedItems,
      query,
    });
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: err.message || "Failed to search items" }, { status: 500 });
  }
}


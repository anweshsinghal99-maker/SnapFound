import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("campus_zone") || searchParams.get("zone");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "24", 10);

    let query = supabaseAdmin
      .from("items")
      .select("id, created_at, title, category, image_url, campus_zone, drop_off_mode, finder_contact, ai_public_tags, public_description, verification_question, status")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (zone && zone !== "all" && zone !== "All Zones") {
      query = query.ilike("campus_zone", `%${zone}%`);
    }

    if (category && category !== "all" && category !== "All Items") {
      query = query.ilike("category", `%${category}%`);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error("Error fetching items:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Never expose secret_detail or handover_pin
    const sanitizedItems = (items || []).map((item) => {
      const { secret_detail, handover_pin, ...safeItem }: any = item;
      return safeItem;
    });

    return NextResponse.json({
      success: true,
      items: sanitizedItems,
      count: sanitizedItems.length,
    });
  } catch (err: any) {
    console.error("Items GET API error:", err);
    return NextResponse.json({ error: err.message || "Failed to load items" }, { status: 500 });
  }
}


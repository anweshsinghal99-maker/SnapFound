import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyClaimWithGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { item_id, user_answer, claimant_name } = await req.json();

    if (!item_id || !user_answer || typeof user_answer !== "string" || user_answer.trim() === "") {
      return NextResponse.json(
        { error: "Item ID and descriptive claim answer are required" },
        { status: 400 }
      );
    }

    // 1. Fetch item with ground-truth secrets using Service Role client
    const { data: item, error: fetchError } = await supabaseAdmin
      .from("items")
      .select("*")
      .eq("id", item_id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json(
        { error: "Item not found in custody ledger" },
        { status: 404 }
      );
    }

    // 2. Call Gemini AI Verification Judge
    const evaluation = await verifyClaimWithGemini(
      item.title,
      item.secret_detail || "Identified distinguishing mark",
      item.verification_question || "Describe unique identifying features",
      user_answer
    );

    // 3. If verified === true, mark item as verified/claimed and release the handover PIN
    if (evaluation.verified) {
      await supabaseAdmin
        .from("items")
        .update({
          status: "verified",
          claimant_name: claimant_name || "Alex Rivera (Verified Campus Student)",
          claimed_at: new Date().toISOString(),
        })
        .eq("id", item_id);

      return NextResponse.json({
        verified: true,
        confidence_score: evaluation.confidence_score,
        feedback_message: evaluation.feedback_message,
        handover_pin: item.handover_pin,
        drop_off_mode: item.drop_off_mode,
        finder_contact: item.finder_contact,
        item: {
          id: item.id,
          title: item.title,
          category: item.category,
          image_url: item.image_url,
          campus_zone: item.campus_zone,
          drop_off_mode: item.drop_off_mode,
          finder_contact: item.finder_contact,
          ai_public_tags: item.ai_public_tags,
          public_description: item.public_description,
          secret_detail: item.secret_detail, // Can reveal unmasked evidence on verified pass
          verification_question: item.verification_question,
          status: "verified",
        },
      });
    }

    // 4. If verified === false, reject gracefully without revealing the ground-truth secret
    return NextResponse.json({
      verified: false,
      confidence_score: evaluation.confidence_score,
      feedback_message:
        evaluation.feedback_message ||
        "The submitted description did not match the protected visual features on this item. Please be more specific or check if this item belongs to you.",
    });
  } catch (err: any) {
    console.error("Error in verify-claim:", err);
    return NextResponse.json(
      { error: err.message || "Failed to evaluate claim" },
      { status: 500 }
    );
  }
}


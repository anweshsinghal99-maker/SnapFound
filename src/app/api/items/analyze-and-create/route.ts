import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { analyzeItemImage, generateEmbedding } from "@/lib/gemini";
import { uploadImageToSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let imageBase64 = "";
    let campus_zone = "Main Library 2F";
    let drop_off_mode = "Security Desk (Desk #1)";
    let finder_contact = "@student_helper";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        imageBase64 = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
      }
      campus_zone = (formData.get("campus_zone") as string) || campus_zone;
      drop_off_mode = (formData.get("drop_off_mode") as string) || drop_off_mode;
      finder_contact = (formData.get("finder_contact") as string) || finder_contact;
    } else {
      const body = await req.json();
      imageBase64 = body.image || "";
      campus_zone = body.campus_zone || campus_zone;
      drop_off_mode = body.drop_off_mode || drop_off_mode;
      finder_contact = body.finder_contact || finder_contact;
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    // 1. Process image buffer and upload to Supabase Storage
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const imageBuffer = Buffer.from(cleanBase64, "base64");

    const imageUrl = await uploadImageToSupabase(imageBuffer, mimeType, "snapfound");

    // 2. Multimodal AI Analysis with Gemini Vision
    const analysis = await analyzeItemImage(imageBase64, mimeType, campus_zone);

    // 3. Generate 768-dim vector embedding
    const embeddingText = `${analysis.title} ${analysis.category} ${analysis.search_corpus} Zone: ${campus_zone}`;
    const embedding = await generateEmbedding(embeddingText);

    // 4. Generate random 4-digit handover PIN
    const handoverPin = Math.floor(1000 + Math.random() * 9000).toString();

    // 5. Insert record into Supabase public.items
    const newItem = {
      title: analysis.title,
      category: analysis.category,
      image_url: imageUrl,
      campus_zone,
      drop_off_mode,
      finder_contact,
      ai_public_tags: analysis.ai_public_tags,
      public_description: analysis.public_description,
      secret_detail: analysis.secret_detail,
      verification_question: analysis.verification_question,
      handover_pin: handoverPin,
      embedding,
      status: "found",
    };

    const { data, error } = await supabaseAdmin
      .from("items")
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the created item, intentionally excluding secret_detail & handover_pin from public response
    const { secret_detail, handover_pin, ...publicItem } = data;

    return NextResponse.json({
      success: true,
      item: publicItem,
      aiAnalysisPreview: {
        title: analysis.title,
        category: analysis.category,
        ai_public_tags: analysis.ai_public_tags,
        public_description: analysis.public_description,
        verification_question: analysis.verification_question,
      },
    });
  } catch (err: any) {
    console.error("Error in analyze-and-create:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process item image" },
      { status: 500 }
    );
  }
}


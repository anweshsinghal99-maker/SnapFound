import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/gemini";

const DEMO_ITEMS = [
  {
    title: "Matte Black Hydro Flask 750ml",
    category: "Bottles & Gear",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAM2QQ9kMowGwAuWwezqi1MPoCd64WGy-xZQWPf9tlhO2iY0SaW4gkkm7EsjE6VSBJ_Kltx9avh7KTmUznHR3VX_9GWRkB9TKE6-jYSgZ7pwLcPfOZ6sNgCQKDVrk_oxqUlCTrotkwpGC2ujZwyLHxZo_4L8MLQP3DG4eB1-w0F8aSosaig500Bgx3hPKhcZR56OQGE-1r2Mb5jwwNo7w5rxx7wSTaYiNELMpiBpzE",
    campus_zone: "Main Library 2F",
    drop_off_mode: "Security Desk (Desk #2)",
    finder_contact: "@alex_mit",
    ai_public_tags: ["#MatteBlack", "#InsulatedFlask", "#SilentZone"],
    public_description:
      "A 750ml matte black stainless steel insulated water bottle found on a study desk on the 2nd floor silent reading room.",
    secret_detail: "Red Spider-Man sticker on bottom base with slight scratch",
    verification_question:
      "What specific sticker, decal, or engraving is on the bottom base/underside of this flask?",
    handover_pin: "4829",
    search_corpus:
      "Matte Black Hydro Flask 750ml water bottle insulated flask metal drink container Main Library 2F study table silent zone alex_mit",
  },
  {
    title: "Casio fx-991ES Plus Scientific Calculator",
    category: "Books & Calculators",
    image_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmeb3-itY3ZAiuoGjU2aOqG88khMriTj_Z1lmfvzOmgR_PFcmxUHrofDMmPqx7t8fvFjqcFr6IUGPlNKyH5VK3dN9ihqScC4e4WL0Rnvt6p7D92_O0EymuFRbJ32MY4XLgQiiZXWiKjWXuPyt8fxY8mizbTRXzM7EmzLVKdekD8ib13Tq4A6_BLEY21NcTbfhOTXLFdOAgv_oy3QvnIBVEi6svqSGst26FS0qTL5U",
    campus_zone: "LT-102 Row G",
    drop_off_mode: "With Finder (@priya_k - Rm 304)",
    finder_contact: "@priya_k",
    ai_public_tags: ["#Calculator", "#SilverBlack", "#LT-102"],
    public_description:
      "Natural Display Casio scientific calculator left on an auditorium bench after the Calculus mid-term exam.",
    secret_detail: "Blue ink signature and roll number 2024-EE-104 written inside the sliding cover",
    verification_question:
      "What handwritten marking, name, or number is written on the inside of the sliding protective cover?",
    handover_pin: "7142",
    search_corpus:
      "Casio fx-991ES Plus Scientific Calculator engineering exam maths LT-102 Row G lecture hall priya_k",
  },
  {
    title: "Campus RFID Student ID & Dorm Key Lanyard",
    category: "ID & Keys",
    image_url:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    campus_zone: "Hostel F Mess",
    drop_off_mode: "Hostel Warden Office (Locker #B-12)",
    finder_contact: "@mess_staff",
    ai_public_tags: ["#IDCard", "#BlueLanyard", "#BrassKey"],
    public_description:
      "Blue woven campus lanyard holding an RFID smart access card and two brass keys found on dining table #14.",
    secret_detail: "Miniature rubber Yoda keychain charm attached to the keyring",
    verification_question:
      "What miniature character or charm is attached next to the two brass keys on the keychain?",
    handover_pin: "9024",
    search_corpus:
      "Campus RFID Student ID Dorm Key Lanyard keys mess hall dining table Hostel F Hostel Warden Office",
  },
  {
    title: "Single White Apple AirPod Pro (Right Ear)",
    category: "Electronics",
    image_url:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    campus_zone: "Indoor Badminton Court",
    drop_off_mode: "Sports Complex Front Desk",
    finder_contact: "@coach_dave",
    ai_public_tags: ["#AirPodPro", "#WhiteAudio", "#Court3"],
    public_description:
      "Single genuine Apple AirPod Pro earbud recovered near Court 3 bleachers during the evening tournament.",
    secret_detail: "Small black silicone aftermarket ear tip size Large with tiny notch",
    verification_question:
      "What color and size is the replacement silicone ear tip fitted on this earbud?",
    handover_pin: "3819",
    search_corpus:
      "Single White Apple AirPod Pro Right Ear earbud wireless bluetooth headphones Indoor Badminton Court Sports Complex",
  },
  {
    title: "Yonex Pro Thermal Badminton Racquet Cover",
    category: "Accessories",
    image_url:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    campus_zone: "Indoor Badminton Court",
    drop_off_mode: "Sports Complex Front Desk",
    finder_contact: "@badminton_club",
    ai_public_tags: ["#YonexCover", "#BlackNeonYellow", "#SportsGear"],
    public_description:
      "Padded dual-racquet black and neon yellow zippered thermal carry case left on the players bench.",
    secret_detail: "Red grip tape tied to the zipper pull tab",
    verification_question:
      "What custom item or tape is wrapped or tied around the main zipper pull?",
    handover_pin: "5501",
    search_corpus:
      "Yonex Pro Thermal Badminton Racquet Cover racquet bag sports equipment Indoor Badminton Court Sports Complex",
  },
  {
    title: "Anker Nano 65W USB-C GaN Fast Charger",
    category: "Electronics",
    image_url:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    campus_zone: "LT-102 Row G",
    drop_off_mode: "With Finder (@sam_tech)",
    finder_contact: "@sam_tech",
    ai_public_tags: ["#USB-C", "#65WGaN", "#BraidedCable"],
    public_description:
      "Compact dark grey 65W fast charger with foldable AC prongs and a 2m grey braided USB-C cable left in the wall outlet.",
    secret_detail: "Green glow-in-the-dark cable tie wrapped around the middle of the wire",
    verification_question:
      "What type or color of velcro/silicone cable organizer tie is attached to the charging cable?",
    handover_pin: "2384",
    search_corpus:
      "Anker Nano 65W USB-C GaN Fast Charger laptop adapter power brick LT-102 Row G Engineering lecture hall sam_tech",
  },
];

export async function POST(req: NextRequest) {
  try {
    const insertedItems = [];

    for (const item of DEMO_ITEMS) {
      const { search_corpus, ...insertItem } = item;
      // Generate real 768-dim embedding
      const embedding = await generateEmbedding(search_corpus || item.title);

      const { data, error } = await supabaseAdmin
        .from("items")
        .insert({
          ...insertItem,
          embedding,
          status: "found",
        })
        .select()
        .single();

      if (error) {
        console.warn("Item seed error, inserting without vector or existing:", error.message);
      } else if (data) {
        insertedItems.push(data);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${insertedItems.length} demo items with 768-dim embeddings!`,
      count: insertedItems.length,
    });
  } catch (err: any) {
    console.error("Demo seed error:", err);
    return NextResponse.json({ error: err.message || "Failed to seed demo data" }, { status: 500 });
  }
}


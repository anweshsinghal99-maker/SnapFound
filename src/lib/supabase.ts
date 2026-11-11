import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rqtlosgxektygbkuaylw.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client for public operations (reads, standard queries)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Admin client for privileged operations (verifying secret detail, updating pins, storage creation)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Uploads an image (Buffer, base64 data, or File) to Supabase Storage 'items' bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImageToSupabase(
  imageBuffer: Buffer,
  contentType: string = "image/jpeg",
  filenamePrefix: string = "item"
): Promise<string> {
  const fileName = `${filenamePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;

  try {
    // Ensure bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const hasBucket = buckets?.some((b) => b.name === "items");
    if (!hasBucket) {
      await supabaseAdmin.storage.createBucket("items", {
        public: true,
      });
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from("items")
      .upload(fileName, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase Storage upload warning, falling back to data URL:", uploadError.message);
      return `data:${contentType};base64,${imageBuffer.toString("base64")}`;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("items")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error("Storage upload exception, fallback to base64 data URL:", err);
    return `data:${contentType};base64,${imageBuffer.toString("base64")}`;
  }
}


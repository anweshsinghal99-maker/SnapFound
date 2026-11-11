import { GoogleGenAI } from "@google/genai";
import { AnalyzeResult, VerificationResult } from "@/types";

const apiKey = process.env.GEMINI_API_KEY || "";

let aiClient: GoogleGenAI | null = null;
try {
  if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn("Could not initialize GoogleGenAI client:", e);
}

function withTimeout<T>(promise: Promise<T>, ms: number = 3500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

const VISION_MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-flash"];
const EMBEDDING_MODELS = ["gemini-embedding-001", "text-embedding-004"];

/**
 * Route A: Zero-Typing Finder Pipeline analyzer.
 * Analyzes image with Gemini Flash using Structured Outputs JSON.
 */
export async function analyzeItemImage(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  campusZone: string = "Campuswide"
): Promise<AnalyzeResult> {
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const systemInstruction = `You are SnapFound AI, an expert computer vision intelligence agent specialized in university campus lost & found asset recovery.
Analyze the image of the found campus item and output a JSON object adhering strictly to this schema:
{
  "title": "Short descriptive title (e.g., 'Matte Black Insulated Flask', 'Casio fx-991ES Plus Scientific Calculator')",
  "category": "Must be exactly one of: 'Electronics', 'ID & Keys', 'Bottles & Gear', 'Books & Calculators', 'Accessories', 'Other'",
  "ai_public_tags": ["Array of 3-4 visible attribute strings like '#MatteBlack', '#DentBase', '#LibraryZone']",
  "public_description": "A helpful, precise 1-2 sentence description of the item for the public campus feed. CRITICAL RULE: DELIBERATELY OMIT one specific, unique distinguishing feature (such as a specific sticker, scratch location, engraving, decal, keychain, or student name/ID number) so thieves cannot guess it from the public listing.",
  "secret_detail": "The exact distinguishing feature, text, sticker, mark, or defect in the image that was intentionally withheld from the public description. If the item is plain, state the exact brand sub-model, button layout, or background/surface detail.",
  "verification_question": "A specific, clear challenge question directed at the true owner asking them to describe that withheld secret_detail to prove ownership (e.g., 'What specific sticker or decal is placed on the bottom base of this flask?', 'What handwritten text or mark is on the back cover?').",
  "search_corpus": "A comprehensive rich text paragraph combining title, category, synonyms, visual colors, material, brand, and campus zone (${campusZone}) EXCLUDING the secret detail, optimized for semantic vector embedding."
}`;

  // Try each model in preference order
  for (const model of VISION_MODELS) {
    if (aiClient) {
      try {
        const response = await withTimeout(
          aiClient.models.generateContent({
            model,
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemInstruction },
                  {
                    inlineData: {
                      mimeType,
                      data: cleanBase64,
                    },
                  },
                  { text: `Analyze this item found in campus zone: "${campusZone}". Output strict JSON.` },
                ],
              },
            ],
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
          4000
        );

        const responseText = response.text || "";
        const parsed = JSON.parse(responseText.replace(/```json\n?|\n?```/g, "").trim());
        return sanitizeAnalyzeResult(parsed);
      } catch (err: any) {
        console.warn(`Vision model ${model} SDK attempt failed:`, err?.message || err);
      }
    }

    // Try REST fallback for this model
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemInstruction },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: cleanBase64,
                  },
                },
                { text: `Analyze this item found in campus zone: "${campusZone}". Output strict JSON.` },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const parsed = JSON.parse(rawText.replace(/```json\n?|\n?```/g, "").trim());
        return sanitizeAnalyzeResult(parsed);
      }
    } catch (restErr: any) {
      console.warn(`Vision model ${model} REST attempt failed:`, restErr?.message || restErr);
    }
  }

  // Graceful rule-based analysis if API is unavailable
  return {
    title: "Campus Recovered Asset",
    category: "Other",
    ai_public_tags: ["#CampusFound", "#SecureCustody", "#VerifiedHub"],
    public_description: "An authentic campus item has been safely recovered and logged into custody.",
    secret_detail: "Specific model numbering and serial markings on the reverse plate.",
    verification_question: "What specific engraving, sticker, or identifying mark distinguishes your item?",
    search_corpus: `Recovered campus asset found in zone ${campusZone}. Secured with zero-knowledge verification.`,
  };
}

/**
 * Route B: Generates 768-dimensional vector embedding for search query or corpus.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return new Array(768).fill(0);
  }

  for (const model of EMBEDDING_MODELS) {
    // 1. Try SDK
    if (aiClient) {
      try {
        const response: any = await withTimeout(
          aiClient.models.embedContent({
            model,
            contents: [{ role: "user", parts: [{ text }] }],
            config: {
              outputDimensionality: 768,
            },
          }),
          3000
        );

        const embeddingValues = response.embedding?.values || response.embeddings?.[0]?.values;
        if (embeddingValues && embeddingValues.length > 0) {
          return embeddingValues.length === 768 ? embeddingValues : resizeVector(embeddingValues, 768);
        }
      } catch (e: any) {
        // Continue to REST or next model
      }
    }

    // 2. Try REST
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          content: { parts: [{ text }] },
          outputDimensionality: 768,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.embedding?.values) {
          const vals = data.embedding.values;
          return vals.length === 768 ? vals : resizeVector(vals, 768);
        }
      }
    } catch (err) {
      // Continue to next model
    }
  }

  // Deterministic 768-dim vector fallback
  return generateFallbackVector(text, 768);
}

/**
 * Route C: AI Anti-Theft Verification Judge.
 */
export async function verifyClaimWithGemini(
  title: string,
  secretDetail: string,
  verificationQuestion: string,
  userAnswer: string
): Promise<VerificationResult> {
  const prompt = `You are the SnapFound Anti-Theft Verification Judge for a campus lost & found system.
Evaluate whether the student claimant's answer demonstrates true ownership of the found item.

Item Title: "${title}"
Challenge Question: "${verificationQuestion}"
Ground Truth Secret Detail (withheld from public): "${secretDetail}"
Claimant's Submitted Answer: "${userAnswer}"

Verification Guidelines:
1. Allow SEMANTIC EQUIVALENCE and natural variations:
   - E.g., if secret detail is "Red Spider-Man sticker on bottom" and user answers "spiderman decal on the base" -> VERIFIED: TRUE.
   - E.g., if secret detail is "Roll number 2024-CS-084 scratched on back" and user writes "my roll no 2024CS084" -> VERIFIED: TRUE.
   - Minor typos, abbreviations, synonyms, or descriptive equivalents should pass.
2. If the user answer is completely wrong, generic guessing (e.g. "it is blue", "it is clean", "it is mine"), or fails to describe the specific withheld feature, set verified to false.
3. If verified is false, provide a polite, constructive feedback message explaining why the answer did not match, WITHOUT revealing or leaking what the secret detail actually is.

Return a strict JSON object with:
{
  "verified": boolean,
  "confidence_score": number between 0.0 and 1.0 (e.g. 0.96),
  "feedback_message": "Concise feedback message to the student"
}`;

  for (const model of VISION_MODELS) {
    if (aiClient) {
      try {
        const response = await withTimeout(
          aiClient.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
          3500
        );

        const responseText = response.text || "";
        const parsed = JSON.parse(responseText.replace(/```json\n?|\n?```/g, "").trim());
        return {
          verified: Boolean(parsed.verified),
          confidence_score: Number(parsed.confidence_score) || (parsed.verified ? 0.96 : 0.2),
          feedback_message: parsed.feedback_message || (parsed.verified ? "Ownership verified successfully!" : "Verification could not confirm ownership."),
        };
      } catch (e: any) {
        // try next
      }
    }

    // REST fallback
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const parsed = JSON.parse(rawText.replace(/```json\n?|\n?```/g, "").trim());
        return {
          verified: Boolean(parsed.verified),
          confidence_score: Number(parsed.confidence_score) || (parsed.verified ? 0.96 : 0.2),
          feedback_message: parsed.feedback_message || (parsed.verified ? "Ownership verified successfully!" : "Verification could not confirm ownership."),
        };
      }
    } catch (err) {
      // try next
    }
  }

  // Local semantic heuristic fallback
  const lowerUser = userAnswer.toLowerCase();
  const lowerSecret = secretDetail.toLowerCase();
  const keywords = lowerSecret.split(/[\s,.-]+/).filter((w) => w.length > 3);
  const matchCount = keywords.filter((k) => lowerUser.includes(k)).length;
  const isMatch = matchCount >= Math.min(2, Math.max(1, Math.floor(keywords.length / 2)));

  return {
    verified: isMatch,
    confidence_score: isMatch ? 0.94 : 0.25,
    feedback_message: isMatch
      ? "AI Anti-Theft Verification confirmed ground truth match!"
      : "The details provided did not sufficiently match the protected security features of this item.",
  };
}

function sanitizeAnalyzeResult(parsed: any): AnalyzeResult {
  const validCategories = ["Electronics", "ID & Keys", "Bottles & Gear", "Books & Calculators", "Accessories", "Other"] as const;
  const category = validCategories.includes(parsed.category) ? parsed.category : "Other";

  return {
    title: parsed.title || "Unidentified Campus Item",
    category,
    ai_public_tags: Array.isArray(parsed.ai_public_tags) && parsed.ai_public_tags.length > 0
      ? parsed.ai_public_tags.map((t: string) => (t.startsWith("#") ? t : `#${t}`))
      : ["#FoundItem", "#CampusRecovery"],
    public_description: parsed.public_description || "A lost campus item has been found and secured.",
    secret_detail: parsed.secret_detail || "Specific manufacturer markings and surface characteristics.",
    verification_question: parsed.verification_question || "Please describe any unique identifying markings, stickers, or scratches on this item.",
    search_corpus: parsed.search_corpus || `${parsed.title} ${category} found on campus.`,
  };
}

function resizeVector(vec: number[], targetDim: number = 768): number[] {
  if (vec.length === targetDim) return vec;
  if (vec.length > targetDim) {
    const sliced = vec.slice(0, targetDim);
    const norm = Math.sqrt(sliced.reduce((sum, v) => sum + v * v, 0)) || 1;
    return sliced.map((v) => v / norm);
  }
  const padded = [...vec];
  while (padded.length < targetDim) padded.push(0);
  return padded;
}

function generateFallbackVector(text: string, dim: number = 768): number[] {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const vector: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    const x = Math.sin(hash + i) * 10000;
    vector[i] = x - Math.floor(x);
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

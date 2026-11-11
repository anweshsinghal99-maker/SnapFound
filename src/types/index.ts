export interface Item {
  id: string;
  created_at: string;
  title: string;
  category: "Electronics" | "ID & Keys" | "Bottles & Gear" | "Books & Calculators" | "Accessories" | "Other";
  image_url: string;
  campus_zone: string;
  drop_off_mode: string;
  finder_contact?: string;
  ai_public_tags: string[];
  public_description: string;
  secret_detail?: string; // Hidden in public queries
  verification_question: string;
  handover_pin?: string; // Hidden in public queries
  search_corpus?: string;
  status: "found" | "claimed" | "verified";
  similarity?: number;
  matchPercentage?: number;
}

export interface AnalyzeResult {
  title: string;
  category: "Electronics" | "ID & Keys" | "Bottles & Gear" | "Books & Calculators" | "Accessories" | "Other";
  ai_public_tags: string[];
  public_description: string;
  secret_detail: string;
  verification_question: string;
  search_corpus: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence_score: number;
  feedback_message: string;
  handover_pin?: string;
  drop_off_mode?: string;
  finder_contact?: string;
  item?: Item;
}

export interface MatchItemResult extends Item {
  similarity: number;
}


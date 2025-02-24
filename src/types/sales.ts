
export type SalesStage = 1 | 2 | 3 | 4;

export interface SalesAnalysis {
  stage: SalesStage;
  type: "positive" | "neutral" | "negative";
  message: string;
  matchScore?: number;
  needsIdentified?: string[];
  brandValues?: boolean;
  closingTechnique?: string;
}


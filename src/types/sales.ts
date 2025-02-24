
export type SalesStage = 1 | 2 | 3 | 4;

export interface SalesAnalysis {
  stage: SalesStage;
  matchScore?: number;
  needsIdentified?: string[];
  brandValues?: boolean;
  closingTechnique?: string;
}

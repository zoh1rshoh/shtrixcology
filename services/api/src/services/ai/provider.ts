import type { AIAnalysisResult } from '@shtrixcology/shared';

export interface AIAnalysisInput {
  imageBase64: string;
  barcode: string;
  productName: string;
}

export interface AIAnalysisFullInput {
  imageBase64: string;
  barcode: string;
  productName: string;
  brand: string | null;
  category: string | null;
  quantity: string | null;
}

export interface AIAnalysisFullResult {
  productName: string;
  brand: string | null;
  category: string | null;
  material: 'plastic' | 'aluminium' | 'paper' | 'glass' | 'other';
  materialCode: string | null;
  isRecyclable: boolean;
  estimatedWeightGrams: number;
  manufacturer: string | null;
  countryOfOrigin: string | null;
  recyclingInstructions: string | null;
  estimatedEcoPoints: number;
  isEmpty: boolean;
  isClean: boolean;
  confidence: number;
  secondLifePredictions: Array<{
    type: string;
    label: string;
    probability: number;
  }>;
}

export interface AIProvider {
  analyzePackaging(input: AIAnalysisInput): Promise<AIAnalysisResult>;
  analyzePackagingFull(
    input: AIAnalysisFullInput
  ): Promise<AIAnalysisFullResult>;
}
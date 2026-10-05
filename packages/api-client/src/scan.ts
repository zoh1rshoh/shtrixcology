import type { ApiClient } from './client.js';

export interface AnalyzeScanRequest {
  barcode: string;
  photoBase64: string;
}

export interface AnalyzeScanResponse {
  productName: string;
  brand: string | null;
  category: string | null;
  material: string;
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
  imageUrl: string | null;
  source: string;
}

export class ScanApi {
  constructor(private client: ApiClient) {}

  analyze(input: AnalyzeScanRequest): Promise<AnalyzeScanResponse> {
    return this.client.post<AnalyzeScanResponse>('/scan/analyze', input);
  }
}
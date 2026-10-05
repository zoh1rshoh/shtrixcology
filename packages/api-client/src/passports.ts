import type {
  CreatePassportResponse,
  ListPassportsResponse,
  PassportDetailResponse,
} from '@shtrixcology/shared';
import type { ApiClient } from './client.js';

// ===========================================
// TYPES
// ===========================================
export interface CreatePassportInput {
  barcode: string;
  productName: string;
  photoBase64: string;
  declaredWeight: number;
  isEmpty: boolean;
  aiData?: {
    material: string;
    materialCode?: string | null;
    isRecyclable?: boolean;
    estimatedWeightGrams?: number;
    manufacturer?: string | null;
    countryOfOrigin?: string | null;
    recyclingInstructions?: string | null;
    confidence?: number;
    secondLifePredictions?: Array<{
      type: string;
      label: string;
      probability: number;
    }>;
  };
}

// ===========================================
// API CLASS
// ===========================================
export class PassportsApi {
  constructor(private client: ApiClient) {}

  create(input: CreatePassportInput): Promise<CreatePassportResponse> {
    return this.client.post<CreatePassportResponse>('/passports', input);
  }

  list(): Promise<ListPassportsResponse> {
    return this.client.get<ListPassportsResponse>('/passports');
  }

  detail(id: string): Promise<PassportDetailResponse> {
    return this.client.get<PassportDetailResponse>(`/passports/${id}`);
  }
}
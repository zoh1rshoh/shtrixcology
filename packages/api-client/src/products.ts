import type { ApiClient } from './client.js';

export interface ProductLookupResult {
  id: string | null;
  barcode: string;
  name: string;
  brand: string | null;
  packagingType: string;
  weightGrams: number | null;
  imageUrl: string | null;
  source: string;
}

export class ProductsApi {
  constructor(private client: ApiClient) {}

  lookup(barcode: string): Promise<ProductLookupResult> {
    return this.client.get<ProductLookupResult>(`/products/${barcode}`);
  }
}
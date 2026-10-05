import { GoogleGenAI } from '@google/genai';
import type {
  AIProvider,
  AIAnalysisInput,
  AIAnalysisFullInput,
  AIAnalysisFullResult,
} from './provider.js';
import type { AIAnalysisResult, MaterialType } from '@shtrixcology/shared';
import { env } from '../../env.js';
import { AppError } from '../../middleware/error.js';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;

  constructor() {
    if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  // ----- Eski metod (saqlab qolamiz) -----
  async analyzePackaging(input: AIAnalysisInput): Promise<AIAnalysisResult> {
    const full = await this.analyzePackagingFull({
      imageBase64: input.imageBase64,
      barcode: input.barcode,
      productName: input.productName,
      brand: null,
      category: null,
      quantity: null,
    });
    return {
      material: full.material,
      confidence: full.confidence,
      isEmpty: full.isEmpty,
      secondLifePredictions: full.secondLifePredictions,
    };
  }

  // ----- Yangi metod — to'liq tahlil -----
  async analyzePackagingFull(
    input: AIAnalysisFullInput
  ): Promise<AIAnalysisFullResult> {
    const prompt = `You are SHTRIXCOLOGY AI — a packaging analysis expert.

Analyze the product packaging in the image and return COMPLETE information.

Context:
- Barcode: ${input.barcode}
- Known name: ${input.productName}
- Known brand: ${input.brand ?? 'unknown'}
- Known category: ${input.category ?? 'unknown'}
- Known quantity: ${input.quantity ?? 'unknown'}

Return ONLY valid JSON in this EXACT format (no markdown, no explanation):

{
  "productName": "Full product name in Uzbek or English",
  "brand": "Brand name",
  "category": "Beverage | Food | Dairy | Snack | Cleaning | Personal Care | Other",
  "material": "plastic | aluminium | paper | glass | other",
  "materialCode": "PET | HDPE | PP | ALU | PAP | GLASS | null",
  "isRecyclable": true,
  "estimatedWeightGrams": 28,
  "manufacturer": "Company name or null",
  "countryOfOrigin": "Country or null",
  "recyclingInstructions": "How to recycle in Uzbek, 1-2 sentences",
  "estimatedEcoPoints": 22,
  "isEmpty": true,
  "isClean": true,
  "confidence": 0.92,
  "secondLifePredictions": [
    { "type": "textile", "label": "Tekstil tolasi", "probability": 0.62 },
    { "type": "bottle", "label": "Yangi shisha", "probability": 0.28 },
    { "type": "other", "label": "Boshqa mahsulot", "probability": 0.10 }
  ]
}

Rules:
- estimatedWeightGrams — packaging ONLY (not contents). For 500ml PET bottle ~28g.
- materialCode — standard code: PET, HDPE, PP, LDPE, PS, ALU, PAP, GLASS
- estimatedEcoPoints — round(weight * 0.8) for plastic, * 2.5 for aluminium
- secondLifePredictions — 3 items, probabilities sum to 1.0
- recyclingInstructions — in Uzbek, practical
- If image unclear → confidence < 0.5, material "other"
- DO NOT invent manufacturer if unknown — use null`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: input.imageBase64.replace(
                    /^data:image\/\w+;base64,/,
                    ''
                  ),
                },
              },
            ],
          },
        ],
      });

      const text = response.text ?? '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in AI response');

      const p = JSON.parse(jsonMatch[0]);

      return {
        productName: p.productName ?? input.productName,
        brand: p.brand ?? input.brand,
        category: p.category ?? null,
        material: (p.material ?? 'other') as MaterialType,
        materialCode: p.materialCode ?? null,
        isRecyclable: p.isRecyclable ?? true,
        estimatedWeightGrams: p.estimatedWeightGrams ?? 30,
        manufacturer: p.manufacturer ?? null,
        countryOfOrigin: p.countryOfOrigin ?? null,
        recyclingInstructions: p.recyclingInstructions ?? null,
        estimatedEcoPoints: p.estimatedEcoPoints ?? 20,
        isEmpty: p.isEmpty ?? true,
        isClean: p.isClean ?? true,
        confidence: p.confidence ?? 0.5,
        secondLifePredictions: p.secondLifePredictions ?? [],
      };
    } catch (err) {
      throw new AppError(
        'AI_ERROR',
        `AI analysis failed: ${(err as Error).message}`,
        502
      );
    }
  }
}
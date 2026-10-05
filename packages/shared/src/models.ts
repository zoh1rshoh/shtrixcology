export type MaterialType = 'plastic' | 'aluminium' | 'paper' | 'glass' | 'other';
export type PassportState = 'created' | 'in_transit' | 'recycled' | 'reborn';
export type UserRole = 'user' | 'operator' | 'recycler' | 'brand_admin' | 'admin';
export type AIStatus = 'pending' | 'passed' | 'rejected';

export interface User {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  city: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string | null;
  packagingType: MaterialType;
  weightGrams: number | null;
  source: 'gs1' | 'openfoodfacts' | 'manual' | 'brand_submitted';
  verified: boolean;
}

export interface SecondLifePrediction {
  type: string;
  label: string;
  probability: number;
}

export interface Passport {
  id: string;
  userId: string;
  productId: string | null;
  barcode: string;
  productName: string;
  aiMaterial: MaterialType;
  aiConfidence: number;
  aiStatus: AIStatus;
  secondLifePredictions: SecondLifePrediction[];
  declaredWeight: number;
  isEmpty: boolean;
  state: PassportState;
  rewardPoints: number;
  photoUrl: string | null;
  createdAt: string;
  verifiedAt: string | null;
  returnedAt: string | null;
  rewardedAt: string | null;
  recycledAt: string | null;
}

export type PassportEventType =
  | 'scanned'
  | 'verified'
  | 'returned'
  | 'received'
  | 'processed'
  | 'reborn';

export interface PassportEvent {
  id: string;
  passportId: string;
  eventType: PassportEventType;
  actor: 'user' | 'ai' | 'pickup' | 'recycler' | 'system';
  location: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  type: 'school' | 'office' | 'neighborhood' | 'family' | 'university';
  city: string;
  captainId: string | null;
  memberCount: number;
  weeklyScore: number;
  createdAt: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: 'captain' | 'member';
  weeklyContribution: number;
  joinedAt: string;
}

export type WalletTransactionReason =
  | 'submission_reward'
  | 'redemption'
  | 'bonus'
  | 'admin_adjust'
  | 'reversal';

export interface WalletTransaction {
  id: string;
  userId: string;
  deltaPoints: number;
  reason: WalletTransactionReason;
  submissionId: string | null;
  redemptionId: string | null;
  balanceAfter: number;
  createdAt: string;
}

export interface ImpactRecord {
  id: string;
  userId: string;
  passportId: string;
  material: MaterialType;
  weightGrams: number;
  co2SavedG: number;
  methodology: string;
  createdAt: string;
}
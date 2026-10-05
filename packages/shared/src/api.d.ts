import type { Passport, User, Team, WalletTransaction, ImpactRecord, MaterialType, SecondLifePrediction, PassportEvent } from './models.js';
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export interface ApiResponse<T> {
    ok: true;
    data: T;
}
export interface ApiErrorResponse {
    ok: false;
    error: ApiError;
}
export interface SignupRequest {
    phone: string;
    email?: string;
    fullName: string;
    password: string;
}
export interface LoginRequest {
    phone: string;
    password: string;
}
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
export interface RefreshRequest {
    refreshToken: string;
}
export interface CreatePassportRequest {
    barcode: string;
    productName: string;
    photoBase64: string;
    declaredWeight: number;
    isEmpty: boolean;
}
export interface CreatePassportResponse {
    passport: Passport;
    rewardPoints: number;
}
export interface ListPassportsResponse {
    passports: Passport[];
    total: number;
}
export interface PassportDetailResponse {
    passport: Passport;
    events: PassportEvent[];
}
export interface AIAnalysisResult {
    material: MaterialType;
    confidence: number;
    isEmpty: boolean;
    secondLifePredictions: SecondLifePrediction[];
}
export interface CreateTeamRequest {
    name: string;
    type: Team['type'];
    city: string;
}
export interface JoinTeamRequest {
    teamId: string;
}
export interface TeamScoreboardResponse {
    team: Team;
    members: Array<{
        userId: string;
        fullName: string;
        weeklyContribution: number;
    }>;
    rank: number;
}
export interface WalletBalanceResponse {
    balance: number;
    transactions: WalletTransaction[];
}
export interface ImpactSummaryResponse {
    passportsCreated: number;
    passportsRecycled: number;
    passportsReborn: number;
    totalCo2SavedG: number;
    records: ImpactRecord[];
}
//# sourceMappingURL=api.d.ts.map
// Credit System Types

export type FeatureType = 
  | 'interior' 
  | 'exterior' 
  | 'sketch' 
  | 'furnish' 
  | 'remove' 
  | 'video'
  | 'text'
  | 'grant'; // For admin credit grants

export type SubscriptionStatus = 
  | 'free' 
  | 'basic' 
  | 'pro' 
  | 'expert';

export interface UserCredits {
  remaining: number;
  total: number;
  subscriptionStatus: SubscriptionStatus;
  lastUpdated: Date;
}

export interface CreditConsumptionRequest {
  feature: FeatureType;
  generationId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreditConsumptionResponse {
  success: boolean;
  remainingCredits: number;
  message: string;
  canProceed: boolean;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  featureUsed: FeatureType;
  creditsConsumed: number;
  generationId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface CreditHistory {
  transactions: CreditTransaction[];
  totalConsumed: number;
  mostUsedFeature: FeatureType;
  averageDaily: number;
}

export interface CreditAnalytics {
  totalUsers: number;
  averageCreditsUsed: number;
  featureDistribution: Record<FeatureType, number>;
  conversionRate: number;
  timeToDepletion: number; // in hours
}

// Error types
export class InsufficientCreditsError extends Error {
  constructor(
    public remainingCredits: number,
    public requiredCredits: number = 1
  ) {
    super(`Insufficient credits. Required: ${requiredCredits}, Available: ${remainingCredits}`);
    this.name = 'InsufficientCreditsError';
  }
}

export class CreditSystemError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CreditSystemError';
  }
}

// Constants
export const CREDIT_CONSTANTS = {
  DEFAULT_CREDITS: 6,
  CREDITS_PER_GENERATION: 1,
  MAX_CREDITS: 1000,
  FEATURES: {
    interior: { name: 'Interior Design', cost: 1 },
    exterior: { name: 'Exterior Design', cost: 1 },
    sketch: { name: 'Sketch to Reality', cost: 1 },
    furnish: { name: 'Furnish Empty Space', cost: 1 },
    remove: { name: 'Remove Object', cost: 1 },
    video: { name: 'Generate Video', cost: 1 },
    text: { name: 'Text to Design', cost: 1 },
    grant: { name: 'Admin Credit Grant', cost: 0 },
  } as const,
  SUBSCRIPTION_BENEFITS: {
    free: { credits: 6, unlimited: false },
    basic: { credits: 100, unlimited: false },
    pro: { credits: -1, unlimited: true },
    expert: { credits: -1, unlimited: true },
  } as const,
} as const;

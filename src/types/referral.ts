// types/referral.ts
export interface ReferralCode {
    id: string;
    userId: string;
    code: string;
    createdAt: string;
    usageCount: number;
  }

  export interface ReferralUse {
    id: string;
    referralId: string;
    referredUserId: string;
    status: 'pending' | 'completed';
    createdAt: string;
  }

  export interface Reward {
    id: string;
    userId: string;
    amount: number;
    type: 'signup' | 'purchase';
    status: 'pending' | 'paid';
    createdAt: string;
  }
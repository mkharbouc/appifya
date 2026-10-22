// ---------------------------------------------------------------------------
// AdMob Monetization & Subscription Management
// Plan: $19 / Month via PayPal (kharbouch.km@gmail.com)
// ---------------------------------------------------------------------------

export const PAYPAL_EMAIL = 'kharbouch.km@gmail.com';
export const SUBSCRIPTION_PRICE_USD = 19;
export const RETENTION_DAYS = 10; // Auto-delete server files after 10 days

export interface AdMobSubscription {
  isActive: boolean;
  plan: 'admob_pro' | 'free';
  expiresAt: string | null;
  daysRemaining: number;
  txnId?: string;
  isExpiringSoon7d: boolean; // 7 days or less
  isExpiringSoon3d: boolean; // 3 days or less
  isExpired: boolean;
  activatedAt?: string;
}

export interface AdMobUnitsConfig {
  appId: string;
  bannerId?: string;
  interstitialId?: string;
  rewardedId?: string;
  appOpenId?: string;
  nativeId?: string;
}

const STORAGE_KEY_PREFIX = 'appifya_sub_';

/**
 * Get the current AdMob subscription for a user.
 */
export function getUserSubscription(userId: string): AdMobSubscription {
  if (typeof window === 'undefined' || !userId) {
    return {
      isActive: false,
      plan: 'free',
      expiresAt: null,
      daysRemaining: 0,
      isExpiringSoon7d: false,
      isExpiringSoon3d: false,
      isExpired: false,
    };
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (!raw) {
      return {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        daysRemaining: 0,
        isExpiringSoon7d: false,
        isExpiringSoon3d: false,
        isExpired: false,
      };
    }

    const data = JSON.parse(raw);
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (!expiresAt || isNaN(expiresAt.getTime())) {
      return {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        daysRemaining: 0,
        isExpiringSoon7d: false,
        isExpiringSoon3d: false,
        isExpired: false,
      };
    }

    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const isExpired = diffMs <= 0;
    const isActive = !isExpired && data.plan === 'admob_pro';
    const isExpiringSoon7d = isActive && daysRemaining <= 7 && daysRemaining > 3;
    const isExpiringSoon3d = isActive && daysRemaining <= 3;

    return {
      isActive,
      plan: isActive ? 'admob_pro' : 'free',
      expiresAt: data.expiresAt,
      daysRemaining,
      txnId: data.txnId,
      isExpiringSoon7d,
      isExpiringSoon3d,
      isExpired,
      activatedAt: data.activatedAt,
    };
  } catch {
    return {
      isActive: false,
      plan: 'free',
      expiresAt: null,
      daysRemaining: 0,
      isExpiringSoon7d: false,
      isExpiringSoon3d: false,
      isExpired: false,
    };
  }
}

/**
 * Activate or renew AdMob Pro subscription ($19/month).
 */
export function activateUserSubscription(
  userId: string,
  txnId: string,
  days = 30
): AdMobSubscription {
  const now = new Date();
  const current = getUserSubscription(userId);

  // If already active, extend from current expiry date; otherwise from now
  const baseDate = current.isActive && current.expiresAt ? new Date(current.expiresAt) : now;
  const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

  const payload = {
    plan: 'admob_pro',
    expiresAt: newExpiry.toISOString(),
    activatedAt: now.toISOString(),
    txnId: txnId.trim() || `PP-MANUAL-${Date.now()}`,
    remindersSent: {
      sevenDay: false,
      threeDay: false,
    },
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save subscription:', err);
  }

  return getUserSubscription(userId);
}

/**
 * Calculate file retention and 10-day auto-deletion.
 */
export function getFileRetentionStatus(createdAt: string | number | Date) {
  const createdDate = new Date(createdAt);
  const expiryDate = new Date(createdDate.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const isExpired = diffMs <= 0;

  return {
    daysLeft,
    isExpired,
    expiryDate: expiryDate.toISOString(),
    retentionDays: RETENTION_DAYS,
  };
}

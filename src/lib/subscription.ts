// ---------------------------------------------------------------------------
// Appifya Pricing, Plans & Monetization Management
// Model: Pay-Once Lifetime Access (Per-App / Agency Pack)
// ---------------------------------------------------------------------------

export const PAYPAL_EMAIL = 'kharbouch.km@gmail.com';

export const PLAN_PRICES = {
  free: 0,
  standard: 29, // $29 one-time for 1 app
  agency: 99,   // $99 one-time for 5 apps (~$20/app)
} as const;

export const ADDON_PRICES = {
  build_reset: 9,    // +3 Rebuilds pack ($9)
  admob_setup: 15,   // Full AdMob configuration setup ($15)
  assetlinks: 9,     // Digital Asset Links setup for Fullscreen ($9)
} as const;

export const RETENTION_DAYS = 10; // Server retention for builds before auto-cleanup

export type PlanType = 'free' | 'standard' | 'agency' | 'admob_pro';

export interface UserSubscription {
  isActive: boolean;
  plan: PlanType;
  licensedAppsCount?: number; // 1 for standard, 5 for agency
  txnId?: string;
  activatedAt?: string;
  addons?: string[];
  daysRemaining?: number; // legacy support
  expiresAt?: string | null; // legacy support
  isExpired?: boolean;
  isExpiringSoon7d?: boolean;
  isExpiringSoon3d?: boolean;
}

// Backwards compatibility alias
export type AdMobSubscription = UserSubscription;

export interface AppBuildRecord {
  buildsUsed: number;
  maxBuilds: number;
  lastBuiltAt?: string;
  hasAdmob: boolean;
  hasKeystore: boolean;
}

const STORAGE_KEY_PREFIX = 'appifya_sub_';
const BUILDS_KEY_PREFIX = 'appifya_builds_';

/**
 * Generate a direct PayPal checkout URL with custom item name and amount
 */
export function getPayPalCheckoutUrl(amount: number, itemName: string): string {
  return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(
    PAYPAL_EMAIL
  )}&currency_code=USD&amount=${amount}&item_name=${encodeURIComponent(itemName)}`;
}

export const PAYPAL_STANDARD_URL = getPayPalCheckoutUrl(PLAN_PRICES.standard, 'Appifya Standard Pro (1 App Lifetime)');
export const PAYPAL_AGENCY_URL = getPayPalCheckoutUrl(PLAN_PRICES.agency, 'Appifya Agency Pack (5 Apps Lifetime)');
export const PAYPAL_DIRECT_PAY_URL = PAYPAL_STANDARD_URL; // default fallback
export const SUBSCRIPTION_PRICE_USD = PLAN_PRICES.standard;

/**
 * Get the current plan for a user
 */
export function getUserSubscription(userId: string): UserSubscription {
  if (typeof window === 'undefined' || !userId) {
    return {
      isActive: false,
      plan: 'free',
      licensedAppsCount: 0,
      daysRemaining: 9999,
      isExpired: false,
      isExpiringSoon7d: false,
      isExpiringSoon3d: false,
    };
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (!raw) {
      return {
        isActive: false,
        plan: 'free',
        licensedAppsCount: 0,
        daysRemaining: 9999,
        isExpired: false,
        isExpiringSoon7d: false,
        isExpiringSoon3d: false,
      };
    }

    const data = JSON.parse(raw);
    const plan: PlanType = data.plan || 'free';
    const isPaid = plan === 'standard' || plan === 'agency' || plan === 'admob_pro';

    return {
      isActive: isPaid,
      plan,
      licensedAppsCount: plan === 'agency' ? 5 : plan === 'standard' || plan === 'admob_pro' ? 1 : 0,
      txnId: data.txnId,
      activatedAt: data.activatedAt,
      addons: data.addons || [],
      daysRemaining: 9999, // Lifetime
      expiresAt: null,
      isExpired: false,
      isExpiringSoon7d: false,
      isExpiringSoon3d: false,
    };
  } catch {
    return {
      isActive: false,
      plan: 'free',
      licensedAppsCount: 0,
      daysRemaining: 9999,
      isExpired: false,
      isExpiringSoon7d: false,
      isExpiringSoon3d: false,
    };
  }
}

/**
 * Activate or upgrade user subscription to Standard ($29) or Agency ($99)
 */
export function activateUserSubscription(
  userId: string,
  txnId: string,
  targetPlan: PlanType | number = 'standard',
  selectedAddons: string[] = []
): UserSubscription {
  const plan: PlanType = typeof targetPlan === 'string' ? targetPlan : 'standard';
  const now = new Date();
  const licensedAppsCount = plan === 'agency' ? 5 : 1;

  const payload = {
    plan,
    licensedAppsCount,
    activatedAt: now.toISOString(),
    txnId: txnId.trim() || `PP-MANUAL-${Date.now()}`,
    addons: selectedAddons,
    isLifetime: true,
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save subscription:', err);
  }

  return getUserSubscription(userId);
}

/**
 * Get build allowance and usage for a specific application
 */
export function getAppBuildInfo(userId: string, appId: string) {
  const sub = getUserSubscription(userId);
  const maxBuilds = sub.isActive ? 3 : 1; // 3 builds for paid plans, 1 build for free trial

  if (typeof window === 'undefined' || !appId) {
    return {
      buildsUsed: 0,
      maxBuilds,
      buildsRemaining: maxBuilds,
      canBuild: true,
      plan: sub.plan,
      isPaid: sub.isActive,
    };
  }

  try {
    const raw = localStorage.getItem(`${BUILDS_KEY_PREFIX}${appId}`);
    const record: AppBuildRecord = raw ? JSON.parse(raw) : { buildsUsed: 0, maxBuilds, hasAdmob: false, hasKeystore: false };
    const effectiveMax = record.maxBuilds || maxBuilds;
    const remaining = Math.max(0, effectiveMax - (record.buildsUsed || 0));

    return {
      buildsUsed: record.buildsUsed || 0,
      maxBuilds: effectiveMax,
      buildsRemaining: remaining,
      canBuild: remaining > 0,
      plan: sub.plan,
      isPaid: sub.isActive,
    };
  } catch {
    return {
      buildsUsed: 0,
      maxBuilds,
      buildsRemaining: maxBuilds,
      canBuild: true,
      plan: sub.plan,
      isPaid: sub.isActive,
    };
  }
}

/**
 * Increment the build usage counter upon a successful build
 */
export function recordSuccessfulBuild(appId: string, hasAdmob = false) {
  if (typeof window === 'undefined' || !appId) return;

  try {
    const raw = localStorage.getItem(`${BUILDS_KEY_PREFIX}${appId}`);
    const record: AppBuildRecord = raw ? JSON.parse(raw) : { buildsUsed: 0, maxBuilds: 3, hasAdmob: false, hasKeystore: true };
    record.buildsUsed = (record.buildsUsed || 0) + 1;
    record.lastBuiltAt = new Date().toISOString();
    record.hasAdmob = hasAdmob;
    record.hasKeystore = true;
    localStorage.setItem(`${BUILDS_KEY_PREFIX}${appId}`, JSON.stringify(record));
  } catch (err) {
    console.error('Failed to record build:', err);
  }
}

/**
 * Add +3 rebuilds to an application (e.g. after purchasing Build Reset add-on)
 */
export function addAppBuildCredits(appId: string, extraCount = 3) {
  if (typeof window === 'undefined' || !appId) return;

  try {
    const raw = localStorage.getItem(`${BUILDS_KEY_PREFIX}${appId}`);
    const record: AppBuildRecord = raw ? JSON.parse(raw) : { buildsUsed: 0, maxBuilds: 3, hasAdmob: false, hasKeystore: true };
    record.maxBuilds = (record.maxBuilds || 3) + extraCount;
    localStorage.setItem(`${BUILDS_KEY_PREFIX}${appId}`, JSON.stringify(record));
  } catch (err) {
    console.error('Failed to add build credits:', err);
  }
}

/**
 * Calculate file retention status for 10-day server auto-deletion
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

// ============================================================================
// UPIShield Risk Engine
// ----------------------------------------------------------------------------
// A mock risk-scoring engine for UPI payments. It evaluates a transaction
// against several heuristics, returns a 0–100 risk score, a tier
// (LOW / MEDIUM / HIGH), plain-language reasons, and a recommendation.
// ============================================================================

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskReason {
  icon: string; // lucide-react icon name
  title: string;
  detail: string;
}

export interface RiskAssessment {
  score: number;
  tier: RiskTier;
  reasons: RiskReason[];
  recommendation: {
    title: string;
    detail: string;
    action: 'proceed' | 'verify' | 'warn';
  };
}

// --- Configuration ----------------------------------------------------------

/** Baseline "normal" average transaction amount (INR). */
const NORMAL_AVERAGE = 1200;

/** Amounts above this multiple of the normal average are flagged. */
const HIGH_AMOUNT_MULTIPLIER = 3;

/** UPI IDs that are considered "known / trusted" beneficiaries. */
const KNOWN_UPI_IDS: string[] = [
  'rahul.sharma@okaxis',
  'priya.patel@ybl',
  'amit.kumar@oksbi',
  'sneha.reddy@ibl',
  'vikram.singh@axl',
];

// --- Types ------------------------------------------------------------------

export interface TransactionInput {
  payeeName: string;
  upiId: string;
  amount: number;
  newDevice: boolean;
}

export interface TransactionRecord extends TransactionInput {
  id: string;
  timestamp: number;
  riskScore: number;
  riskTier: RiskTier;
  reasons: RiskReason[];
  status: 'completed' | 'cancelled';
}

// --- Scoring helpers --------------------------------------------------------

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function tierForScore(score: number): RiskTier {
  if (score <= 40) return 'LOW';
  if (score <= 70) return 'MEDIUM';
  return 'HIGH';
}

// --- Main scoring function --------------------------------------------------

export function assessRisk(
  input: TransactionInput,
  history: TransactionRecord[] = [],
): RiskAssessment {
  const reasons: RiskReason[] = [];
  let score = 0;

  // 0. Beneficiary trust — count prior *completed* payments to this UPI ID.
  // Each prior payment reduces the first-time penalty; 3+ payments make
  // this a trusted beneficiary with a small risk discount.
  const priorPayments = history.filter(
    (tx) => tx.upiId.toLowerCase().trim() === input.upiId.toLowerCase().trim() && tx.status === 'completed',
  );
  const priorCount = priorPayments.length;

  // 1. Amount anomaly — how far above the normal average?
  if (input.amount > NORMAL_AVERAGE * HIGH_AMOUNT_MULTIPLIER) {
    const ratio = input.amount / NORMAL_AVERAGE;
    // Scale: 3× = +25, 5× = +35, 10×+ = +45 (capped)
    const amountScore = Math.min(45, 15 + (ratio - 3) * 5);
    score += amountScore;
    reasons.push({
      icon: 'IndianRupee',
      title: 'Unusually high amount',
      detail: `₹${input.amount.toLocaleString('en-IN')} is ${(ratio).toFixed(1)}× your usual average of ₹${NORMAL_AVERAGE.toLocaleString('en-IN')}.`,
    });
  } else if (input.amount > NORMAL_AVERAGE * 1.5) {
    score += 12;
    reasons.push({
      icon: 'TrendingUp',
      title: 'Above average amount',
      detail: `This payment is higher than your typical transaction of ₹${NORMAL_AVERAGE.toLocaleString('en-IN')}.`,
    });
  }

  // 2. First-time beneficiary — unless they have prior completed payments.
  const isKnown = KNOWN_UPI_IDS.includes(input.upiId.toLowerCase().trim());
  if (!isKnown && priorCount === 0) {
    score += 30;
    reasons.push({
      icon: 'UserPlus',
      title: 'First-time recipient',
      detail: `You haven't sent money to ${input.upiId} before. Verify the UPI ID and the recipient's name carefully.`,
    });
  } else if (priorCount >= 3) {
    // Trusted beneficiary — small risk discount for a strong track record.
    score -= 10;
    reasons.push({
      icon: 'ShieldCheck',
      title: 'Trusted recipient',
      detail: `You've made ${priorCount} successful payments to ${input.payeeName} before. This recipient has a strong trust history.`,
    });
  } else if (priorCount >= 1) {
    // Repeat beneficiary — reduce the first-time penalty proportionally.
    score -= 5;
    reasons.push({
      icon: 'ShieldCheck',
      title: 'Repeat recipient',
      detail: `You've paid ${input.payeeName} ${priorCount} time${priorCount === 1 ? '' : 's'} before. This reduces the risk score.`,
    });
  }

  // 3. New device / context
  if (input.newDevice) {
    score += 25;
    reasons.push({
      icon: 'Smartphone',
      title: 'New device or location',
      detail: "This payment is being made from a device or location you don't usually use.",
    });
  }

  // 4. Late-night heuristic (simulated — treat as always "normal" for demo
  // unless we later add a time toggle). Kept here as an extension point.

  // 5. UPI ID format sanity
  const upiPattern = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
  if (!upiPattern.test(input.upiId.trim())) {
    score += 15;
    reasons.push({
      icon: 'AlertTriangle',
      title: 'Unusual UPI ID format',
      detail: `"${input.upiId}" doesn't look like a standard UPI ID. Double-check for typos or impersonation.`,
    });
  }

  // 6. Round-number / "too clean" amount scam heuristic
  if (input.amount >= 5000 && input.amount % 1000 === 0) {
    score += 8;
    reasons.push({
      icon: 'Hash',
      title: 'Suspiciously round amount',
      detail: 'Scam amounts are often round numbers (₹5,000, ₹10,000). Confirm the exact amount with the recipient.',
    });
  }

  // If only positive (trust) reasons triggered and no risk signals, show a clean message.
  const hasRiskSignals = reasons.some((r) => r.icon !== 'ShieldCheck');
  if (reasons.length === 0 || (!hasRiskSignals && priorCount === 0)) {
    reasons.length = 0;
    reasons.push({
      icon: 'ShieldCheck',
      title: 'No risk signals detected',
      detail: 'This transaction matches your normal payment patterns.',
    });
  }

  score = clampScore(score);
  const tier = tierForScore(score);

  return {
    score,
    tier,
    reasons,
    recommendation: recommendationFor(tier),
  };
}

function recommendationFor(tier: RiskTier): RiskAssessment['recommendation'] {
  switch (tier) {
    case 'LOW':
      return {
        title: 'Safe to proceed',
        detail: 'This transaction looks normal. You can go ahead and complete the payment.',
        action: 'proceed',
      };
    case 'MEDIUM':
      return {
        title: 'Verify before paying',
        detail: 'Please confirm the recipient and amount through a trusted channel (call or in-person) before proceeding.',
        action: 'verify',
      };
    case 'HIGH':
      return {
        title: 'Do not proceed',
        detail: 'Multiple strong risk signals were detected. We strongly recommend cancelling this payment and reporting if you suspect fraud.',
        action: 'warn',
      };
  }
}

// --- Mock seed data ----------------------------------------------------------

export const SEED_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'seed-1',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    payeeName: 'Rahul Sharma',
    upiId: 'rahul.sharma@okaxis',
    amount: 850,
    newDevice: false,
    riskScore: 8,
    riskTier: 'LOW',
    reasons: [{ icon: 'ShieldCheck', title: 'No risk signals detected', detail: 'Known recipient, normal amount.' }],
    status: 'completed',
  },
  {
    id: 'seed-2',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    payeeName: 'Unknown Vendor',
    upiId: 'cheapdeals@xyz',
    amount: 4999,
    newDevice: true,
    riskScore: 78,
    riskTier: 'HIGH',
    reasons: [
      { icon: 'UserPlus', title: 'First-time recipient', detail: 'Never sent money to this UPI ID before.' },
      { icon: 'Smartphone', title: 'New device', detail: 'Payment from an unfamiliar device.' },
    ],
    status: 'cancelled',
  },
  {
    id: 'seed-3',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    payeeName: 'Priya Patel',
    upiId: 'priya.patel@ybl',
    amount: 1500,
    newDevice: false,
    riskScore: 12,
    riskTier: 'LOW',
    reasons: [{ icon: 'TrendingUp', title: 'Above average amount', detail: 'Slightly above your average.' }],
    status: 'completed',
  },
  {
    id: 'seed-4',
    timestamp: Date.now() - 1000 * 60 * 45,
    payeeName: 'Contest Winner',
    upiId: 'reward-center@paytm',
    amount: 5000,
    newDevice: false,
    riskScore: 53,
    riskTier: 'MEDIUM',
    reasons: [
      { icon: 'UserPlus', title: 'First-time recipient', detail: 'New UPI ID.' },
      { icon: 'Hash', title: 'Suspiciously round amount', detail: 'Round-number amount often seen in scams.' },
    ],
    status: 'cancelled',
  },
];

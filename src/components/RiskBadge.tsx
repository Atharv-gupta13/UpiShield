import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { RiskTier } from '@/utils/riskEngine';

const TIER_CONFIG: Record<RiskTier, {
  label: string;
  bg: string;
  text: string;
  ring: string;
  Icon: typeof ShieldCheck;
}> = {
  LOW: {
    label: 'LOW RISK',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    Icon: ShieldCheck,
  },
  MEDIUM: {
    label: 'MEDIUM RISK',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
    Icon: AlertTriangle,
  },
  HIGH: {
    label: 'HIGH RISK',
    bg: 'bg-red-50',
    text: 'text-red-700',
    ring: 'ring-red-200',
    Icon: ShieldAlert,
  },
};

export default function RiskBadge({
  tier,
  score,
  size = 'md',
}: {
  tier: RiskTier;
  score: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cfg = TIER_CONFIG[tier];
  const Icon = cfg.Icon;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3.5 py-1.5 text-sm gap-1.5',
    lg: 'px-5 py-2.5 text-base gap-2',
  }[size];

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 18;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring} ${sizeClasses}`}
    >
      <Icon size={iconSize} strokeWidth={2.5} />
      <span>{cfg.label}</span>
      <span className="opacity-70">·</span>
      <span className="tabular-nums">{score}/100</span>
    </span>
  );
}

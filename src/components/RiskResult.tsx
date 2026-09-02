import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Info,
} from 'lucide-react';
import type { RiskAssessment, TransactionInput } from '@/utils/riskEngine';
import RiskBadge from './RiskBadge';

interface Props {
  assessment: RiskAssessment;
  transaction: TransactionInput | null;
  onProceed: () => void;
  onCancel: () => void;
}

const ICON_MAP: Record<string, typeof ShieldCheck> = {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  IndianRupee: ShieldCheck,
  TrendingUp: AlertTriangle,
  UserPlus: ShieldCheck,
  Smartphone: ShieldCheck,
  Hash: AlertTriangle,
};

const TIER_STYLES = {
  LOW: {
    accent: 'border-emerald-500',
    glow: 'bg-emerald-50',
    iconBg: 'bg-emerald-600',
    Icon: ShieldCheck,
  },
  MEDIUM: {
    accent: 'border-amber-500',
    glow: 'bg-amber-50',
    iconBg: 'bg-amber-500',
    Icon: AlertTriangle,
  },
  HIGH: {
    accent: 'border-red-500',
    glow: 'bg-red-50',
    iconBg: 'bg-red-600',
    Icon: ShieldAlert,
  },
};

export default function RiskResult({ assessment, transaction, onProceed, onCancel }: Props) {
  const navigate = useNavigate();
  const tier = assessment.tier;
  const style = TIER_STYLES[tier];
  const RecIcon = style.Icon;

  if (!transaction) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-gray-500 mb-4">No transaction to analyze yet.</p>
        <button onClick={() => navigate('/')} className="text-emerald-600 font-medium hover:underline">
          Go to payment screen
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Score card */}
      <div className={`rounded-2xl border-l-4 ${style.accent} ${style.glow} p-6 mb-5 shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${style.iconBg} shadow-md`}>
            <RecIcon size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <RiskBadge tier={tier} score={assessment.score} size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {tier === 'LOW' && 'Looks Safe'}
          {tier === 'MEDIUM' && 'Needs Verification'}
          {tier === 'HIGH' && 'High Risk Detected'}
        </h1>
        <p className="text-sm text-gray-600">
          Paying <span className="font-semibold">{transaction.payeeName}</span> ({transaction.upiId}){' '}
          ₹{transaction.amount.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Why is this risky? */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info size={18} className="text-emerald-600" />
          Why is this risky?
        </h2>
        <div className="space-y-3">
          {assessment.reasons.map((reason, i) => {
            const Icon = ICON_MAP[reason.icon] ?? ShieldCheck;
            return (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ring-1 ring-gray-100">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{reason.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{reason.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-2xl p-5 mb-6 ${style.glow} border ${style.accent.replace('border-', 'border-')}`}>
        <h3 className="font-semibold text-gray-900 mb-1">{assessment.recommendation.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{assessment.recommendation.detail}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-all"
        >
          <XCircle size={20} />
          Cancel Payment
        </button>
        <button
          onClick={onProceed}
          className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-all shadow-lg ${
            tier === 'HIGH'
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
          }`}
        >
          <CheckCircle2 size={20} />
          Proceed Anyway
        </button>
      </div>
    </div>
  );
}

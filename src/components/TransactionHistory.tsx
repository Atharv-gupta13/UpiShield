import { useNavigate } from 'react-router-dom';
import { ArrowRight, History, Trash2 } from 'lucide-react';
import type { TransactionRecord } from '@/utils/riskEngine';
import RiskBadge from './RiskBadge';

interface Props {
  transactions: TransactionRecord[];
  onClear: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function TransactionHistory({ transactions, onClear }: Props) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History size={22} className="text-emerald-600" />
          <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} /> Clear
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl ring-1 ring-gray-100">
          <p className="text-gray-400 mb-4">No transactions yet.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-emerald-600 font-medium hover:underline"
          >
            Make your first payment <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{tx.payeeName}</p>
                    {tx.status === 'cancelled' && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                        Cancelled
                      </span>
                    )}
                    {tx.status === 'completed' && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
                        Paid
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{tx.upiId}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(tx.timestamp)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 tabular-nums">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </p>
                  <div className="mt-1.5">
                    <RiskBadge tier={tx.riskTier} score={tx.riskScore} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="New payment"
      >
        <span className="text-2xl font-light">+</span>
      </button>
    </div>
  );
}

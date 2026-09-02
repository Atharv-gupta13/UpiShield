import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, LayoutDashboard, Share2, Check } from 'lucide-react';
import type { TransactionRecord } from '@/utils/riskEngine';

interface Props {
  transaction: TransactionRecord | null;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function genRefId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export default function PaymentSuccess({ transaction }: Props) {
  const navigate = useNavigate();
  const [refId] = useState(() => genRefId());
  const [showCheck, setShowCheck] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCheck(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!transaction) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-gray-500 mb-4">No recent transaction found.</p>
        <button onClick={() => navigate('/')} className="text-emerald-600 font-medium hover:underline">
          Go to payment screen
        </button>
      </div>
    );
  }

  function copyRef() {
    navigator.clipboard?.writeText(refId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Success animation banner */}
      <div className="flex flex-col items-center pt-6 pb-8">
        <div
          className={`relative flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500 transition-all duration-500 ${
            showCheck ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
          <CheckCircle2
            size={56}
            className="text-white transition-all duration-500"
            strokeWidth={2.5}
            style={{ transform: showCheck ? 'scale(1)' : 'scale(0)', transitionDelay: '200ms' }}
          />
        </div>
        <h1
          className={`text-2xl font-bold text-gray-900 mt-5 transition-all duration-500 ${
            showCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          Payment Successful
        </h1>
        <p
          className={`text-sm text-gray-500 mt-1 transition-all duration-500 ${
            showCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          ₹{transaction.amount.toLocaleString('en-IN')} paid successfully
        </p>
      </div>

      {/* Payment details card */}
      <div
        className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden transition-all duration-500 ${
          showCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '500ms' }}
      >
        {/* Amount banner */}
        <div className="bg-emerald-50 px-6 py-5 text-center border-b border-emerald-100">
          <p className="text-3xl font-bold text-emerald-700 tabular-nums">
            ₹{transaction.amount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Details rows */}
        <div className="px-6 py-4 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Paid to</span>
            <span className="font-medium text-gray-900">{transaction.payeeName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">UPI ID</span>
            <span className="font-medium text-gray-900">{transaction.upiId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Date & Time</span>
            <span className="font-medium text-gray-900">{formatTime(transaction.timestamp)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Risk Level</span>
            <span className="font-medium text-gray-900">{transaction.riskTier}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status</span>
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
              <Check size={14} strokeWidth={3} /> Completed
            </span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-gray-500">UPI Ref. ID</span>
            <button
              onClick={copyRef}
              className="inline-flex items-center gap-1.5 font-mono font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              {refId}
              {copied ? <Check size={14} strokeWidth={3} /> : <Share2 size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className={`flex gap-3 mt-5 transition-all duration-500 ${
          showCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '600ms' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-all"
        >
          <Home size={20} /> New Payment
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/25"
        >
          <LayoutDashboard size={20} /> View History
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        This is a simulated payment. No real money was transferred.
      </p>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Smartphone, ShieldCheck, IndianRupee } from 'lucide-react';
import type { TransactionInput } from '@/utils/riskEngine';

interface Props {
  onSubmit: (input: TransactionInput) => void;
}

const PRESETS = [
  { label: 'Safe', payeeName: 'Rahul Sharma', upiId: 'rahul.sharma@okaxis', amount: 500, newDevice: false },
  { label: 'Medium', payeeName: 'Contest Winner', upiId: 'reward-center@paytm', amount: 5000, newDevice: false },
  { label: 'High Risk', payeeName: 'Unknown Vendor', upiId: 'cheapdeals@xyz', amount: 15000, newDevice: true },
];

export default function PaymentForm({ onSubmit }: Props) {
  const navigate = useNavigate();
  const [payeeName, setPayeeName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [newDevice, setNewDevice] = useState(false);
  const [touched, setTouched] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const isValid = payeeName.trim() && upiId.trim() && amountNum > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit({ payeeName: payeeName.trim(), upiId: upiId.trim(), amount: amountNum, newDevice });
    navigate('/result');
  }

  function loadPreset(p: typeof PRESETS[0]) {
    setPayeeName(p.payeeName);
    setUpiId(p.upiId);
    setAmount(String(p.amount));
    setNewDevice(p.newDevice);
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 mb-3 shadow-lg shadow-emerald-600/30">
          <ShieldCheck size={28} className="text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Review Payment</h1>
        <p className="text-sm text-gray-500 mt-1">UPIShield will analyze this transaction for fraud risk before you pay.</p>
      </div>

      {/* Preset chips */}
      <div className="flex gap-2 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => loadPreset(p)}
            className="flex-1 text-xs font-medium px-3 py-2 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 space-y-5"
      >
        {/* Payee Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Payee Name</label>
          <input
            type="text"
            value={payeeName}
            onChange={(e) => setPayeeName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-gray-900 placeholder-gray-400"
          />
          {touched && !payeeName.trim() && (
            <p className="text-xs text-red-500 mt-1">Name is required</p>
          )}
        </div>

        {/* UPI ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. rahul.sharma@okaxis"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-gray-900 placeholder-gray-400"
          />
          {touched && !upiId.trim() && (
            <p className="text-xs text-red-500 mt-1">UPI ID is required</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (INR)</label>
          <div className="relative">
            <IndianRupee size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
          {touched && amountNum <= 0 && (
            <p className="text-xs text-red-500 mt-1">Enter a valid amount</p>
          )}
        </div>

        {/* New device toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">New device / context</p>
              <p className="text-xs text-gray-400">Toggle to simulate an unfamiliar device</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={newDevice}
            onClick={() => setNewDevice(!newDevice)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newDevice ? 'bg-emerald-600' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${newDevice ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Pay button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/25"
        >
          Pay ₹{amountNum > 0 ? amountNum.toLocaleString('en-IN') : '0'}
          <ArrowRight size={20} />
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-4">
        Simulated payments only — no real money is moved.
      </p>
    </div>
  );
}

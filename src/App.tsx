import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Home, LayoutDashboard } from 'lucide-react';
import {
  assessRisk,
  SEED_TRANSACTIONS,
  type TransactionInput,
  type TransactionRecord,
  type RiskAssessment,
} from '@/utils/riskEngine';
import PaymentForm from '@/components/PaymentForm';
import RiskResult from '@/components/RiskResult';
import PaymentSuccess from '@/components/PaymentSuccess';
import TransactionHistory from '@/components/TransactionHistory';

const STORAGE_KEY = 'upishield_transactions';

function loadTransactions(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  // First load — seed with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRANSACTIONS));
  return SEED_TRANSACTIONS;
}

function AppRoutes() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [currentInput, setCurrentInput] = useState<TransactionInput | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<RiskAssessment | null>(null);
  const [lastTransaction, setLastTransaction] = useState<TransactionRecord | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleSubmit = useCallback((input: TransactionInput) => {
    setCurrentInput(input);
    setCurrentAssessment(assessRisk(input));
  }, []);

  const saveTransaction = useCallback(
    (status: 'completed' | 'cancelled') => {
      if (!currentInput || !currentAssessment) return null;
      const record: TransactionRecord = {
        id: `tx-${Date.now()}`,
        timestamp: Date.now(),
        payeeName: currentInput.payeeName,
        upiId: currentInput.upiId,
        amount: currentInput.amount,
        newDevice: currentInput.newDevice,
        riskScore: currentAssessment.score,
        riskTier: currentAssessment.tier,
        reasons: currentAssessment.reasons,
        status,
      };
      setTransactions((prev) => {
        const updated = [record, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      return record;
    },
    [currentInput, currentAssessment],
  );

  const handleProceed = useCallback(() => {
    const record = saveTransaction('completed');
    setLastTransaction(record);
    setCurrentInput(null);
    setCurrentAssessment(null);
    navigate('/success');
  }, [saveTransaction, navigate]);

  const handleCancel = useCallback(() => {
    saveTransaction('cancelled');
    setCurrentInput(null);
    setCurrentAssessment(null);
    navigate('/dashboard');
  }, [saveTransaction, navigate]);

  const handleClear = useCallback(() => {
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900">UPIShield</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/' || location.pathname === '/result' || location.pathname === '/success'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Home size={16} /> Pay
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard size={16} /> History
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <Routes>
          <Route path="/" element={<PaymentForm onSubmit={handleSubmit} />} />
          <Route
            path="/result"
            element={
              <RiskResult
                assessment={currentAssessment ?? assessRisk(currentInput ?? { payeeName: '', upiId: '', amount: 0, newDevice: false })}
                transaction={currentInput}
                onProceed={handleProceed}
                onCancel={handleCancel}
              />
            }
          />
          <Route path="/success" element={<PaymentSuccess transaction={lastTransaction} />} />
          <Route path="/dashboard" element={<TransactionHistory transactions={transactions} onClear={handleClear} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 pb-6">
        UPIShield — Hackathon Demo · Simulated fraud detection
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

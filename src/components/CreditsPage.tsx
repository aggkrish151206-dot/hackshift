import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  ArrowUpRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Clock,
  Zap,
  Info,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CreditPackage } from '../types';

export const CreditsPage: React.FC = () => {
  const {
    currentUser,
    creditsBalance,
    creditTransactions,
    creditPackages,
    isCreditsLoading,
    refreshCredits,
    purchasePackage,
    navigateTo,
  } = useApp();

  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!currentUser) return null;

  const handleBuyClick = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setPurchaseNotice(null);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;
    setIsProcessing(true);
    setPurchaseNotice(null);

    try {
      const res = await purchasePackage(selectedPackage.id);
      if (res.success) {
        setPurchaseNotice({
          type: 'success',
          message: res.message || `Successfully purchased ${selectedPackage.credits} credits!`,
        });
        setSelectedPackage(null);
      } else {
        setPurchaseNotice({
          type: 'error',
          message: res.message || 'Payment processing failed. Please try again.',
        });
      }
    } catch (err: any) {
      setPurchaseNotice({
        type: 'error',
        message: err.message || 'Payment processing error.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Credits & Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            BlindProof tasks cost 100 credits each. New builders start with 300 initial credits.
          </p>
        </div>

        <button
          onClick={() => refreshCredits()}
          disabled={isCreditsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCreditsLoading ? 'animate-spin text-slate-900' : ''}`} />
          <span>Refresh Balance</span>
        </button>
      </div>

      {purchaseNotice && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 text-xs ${
            purchaseNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {purchaseNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{purchaseNotice.message}</div>
          <button
            onClick={() => setPurchaseNotice(null)}
            className="text-slate-400 hover:text-slate-700 text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION A: Current Balance Card */}
      <section className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-medium">
              <Coins className="w-3.5 h-3.5" />
              <span>Available Credit Balance</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white">
                {creditsBalance}
              </span>
              <span className="text-slate-400 text-sm font-medium">Credits Available</span>
            </div>

            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Enough to start{' '}
              <strong className="text-white font-mono">{Math.floor(creditsBalance / 100)}</strong> new technical challenge{Math.floor(creditsBalance / 100) === 1 ? '' : 's'}. Re-opening or editing started challenges never incurs additional deductions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="#packages"
              className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-md text-center transition-colors shadow-sm"
            >
              Buy Credits
            </a>
            <button
              onClick={() => navigateTo('catalog')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-center transition-colors"
            >
              Browse Challenges
            </button>
          </div>
        </div>
      </section>

      {/* SECTION B: Credit Packages */}
      <section id="packages" className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Credit Packages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose a package to unlock more startup engineering tasks. All payments are verified on the server.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`relative bg-white border rounded-lg p-5 flex flex-col justify-between transition-all ${
                  pkg.popular
                    ? 'border-slate-900 shadow-sm ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {pkg.badge && (
                  <div
                    className={`absolute -top-2.5 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      pkg.popular
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {pkg.badge}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-mono text-2xl font-extrabold text-slate-900">${pkg.priceUsd}</span>
                      <span className="text-[11px] text-slate-400">USD</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono font-bold text-slate-900">{pkg.credits}</span>
                    <span className="text-slate-500">Credits</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                    {pkg.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleBuyClick(pkg)}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-md transition-colors ${
                      pkg.popular
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-800'
                    }`}
                  >
                    Purchase {pkg.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Checkout Modal / Drawer */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-700" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Checkout · {selectedPackage.name} Package
                </h3>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Credit Amount:</span>
                <span className="font-mono font-semibold text-slate-900">+{selectedPackage.credits} Credits</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Task Capacity:</span>
                <span className="font-medium text-slate-900">{Math.floor(selectedPackage.credits / 100)} Micro-tasks</span>
              </div>
              <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2 font-semibold">
                <span>Price (Configurable placeholder):</span>
                <span className="font-mono text-sm text-slate-900">${selectedPackage.priceUsd}.00 USD</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Server-Verified Payment Engine</span>
              </div>
              <p className="text-blue-800 leading-normal">
                Payment verification runs idempotently through the BlindProof server ledger abstraction. Frontend cannot spoof credit additions.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                disabled={isProcessing}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={isProcessing}
                className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay ${selectedPackage.priceUsd}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: Transaction History */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Credit Transaction History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditable ledger of all bonuses, task unlocks, and credit purchases.
          </p>
        </div>

        {creditTransactions.length === 0 ? (
          <div className="p-8 text-center border border-slate-200 rounded-lg text-xs text-slate-500">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Credit Change</th>
                    <th className="py-2.5 px-4 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {creditTransactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tx.type === 'Initial Bonus'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : tx.type === 'Purchase'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : tx.type === 'Task Usage'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                          <span className={isPositive ? 'text-emerald-600' : 'text-slate-900'}>
                            {isPositive ? `+${tx.amount}` : tx.amount}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                          {tx.balanceAfter}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

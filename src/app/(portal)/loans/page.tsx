"use client";

import { useState } from "react";
import { 
  Landmark, Plus, X, Home, Car, CreditCard, Banknote, 
  Calendar, ShieldCheck, TrendingDown, CheckCircle2, Loader2, Sparkles, AlertTriangle
} from "lucide-react";

// Robust dummy data
const loansData = [
  { id: 1, name: "Home Mortgage", lender: "Zenith Bank", type: "mortgage", currency: "₦", originalAmount: 45000000, currentBalance: 38500000, apr: 8.5, payment: 350000, frequency: "monthly", nextDate: "May 01, 2026", icon: Home, color: "text-indigo-500", bg: "bg-indigo-500/10", fill: "bg-indigo-500", history: [ { date: "Apr 01, 2026", amount: 350000 }, { date: "Mar 01, 2026", amount: 350000 } ] },
  { id: 2, name: "Tesla Model 3", lender: "Capital One", type: "auto", currency: "$", originalAmount: 45000, currentBalance: 28000, apr: 4.2, payment: 750, frequency: "monthly", nextDate: "Apr 15, 2026", icon: Car, color: "text-blue-500", bg: "bg-blue-500/10", fill: "bg-blue-500", history: [ { date: "Mar 15, 2026", amount: 750 } ] },
  { id: 3, name: "AMEX Platinum", lender: "American Express", type: "credit", currency: "$", originalAmount: 5000, currentBalance: 450, apr: 21.99, payment: 150, frequency: "weekly", nextDate: "Apr 20, 2026", icon: CreditCard, color: "text-rose-500", bg: "bg-rose-500/10", fill: "bg-rose-500", history: [ { date: "Apr 13, 2026", amount: 150 }, { date: "Apr 06, 2026", amount: 150 } ] },
  { id: 4, name: "Business Loan", lender: "Bank of Industry", type: "personal", currency: "₦", originalAmount: 10000000, currentBalance: 8200000, apr: 5.0, payment: 1440000, frequency: "yearly", nextDate: "Jan 15, 2027", icon: Landmark, color: "text-amber-500", bg: "bg-amber-500/10", fill: "bg-amber-500", history: [ { date: "Jan 15, 2026", amount: 1440000 } ] }
];

export default function LoansPage() {
  const [baseCurrency, setBaseCurrency] = useState<"NGN" | "GBP" | "USD">("NGN");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "manage">("add");
  const [manageTab, setManageTab] = useState<"pay" | "history">("pay");
  const [selectedLoan, setSelectedLoan] = useState<typeof loansData[0] | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Smart Form State (Added totalRepayment)
  const [addForm, setAddForm] = useState({
    originalAmount: "",
    currentBalance: "",
    apr: "",
    totalRepayment: "",
    payment: "",
    frequency: "monthly"
  });

  const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const overviewData = {
    NGN: { total: "₦89,150,000", obligation: "₦1,550,000" },
    GBP: { total: "£44,575", obligation: "£775" },
    USD: { total: "$56,200", obligation: "$980" }
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => setIsLoadingMore(false), 1000);
  };

  const openAddDrawer = () => {
    setDrawerMode("add");
    setSelectedLoan(null);
    setAddForm({ originalAmount: "", currentBalance: "", apr: "", totalRepayment: "", payment: "", frequency: "monthly" });
    setIsDrawerOpen(true);
  };

  const openManageDrawer = (loan: typeof loansData[0]) => {
    setDrawerMode("manage");
    setManageTab("pay");
    setSelectedLoan(loan);
    setIsDrawerOpen(true);
  };

  // --- SMART CALCULATOR LOGIC (Updated to fix TS error and handle Total Repayment) ---
  const calculatePayoff = () => {
    const p = parseFloat(addForm.currentBalance) || parseFloat(addForm.originalAmount) || 0;
    const pmt = parseFloat(addForm.payment) || 0;
    const apr = parseFloat(addForm.apr) || 0;
    const totalRepay = parseFloat(addForm.totalRepayment) || 0;
    
    if (p <= 0 || pmt <= 0) return null;

    const periodsPerYear = addForm.frequency === 'weekly' ? 52 : addForm.frequency === 'yearly' ? 1 : 12;
    let n = 0;
    let totalInterest = 0;
    let warningMsg = "";

    // 1. If user provides Total Repayment, it overrides complex APR math
    if (totalRepay > 0) {
      n = Math.ceil(totalRepay / pmt);
      totalInterest = Math.max(0, totalRepay - p);
    } 
    // 2. If user provides APR, do true amortization math
    else if (apr > 0) {
      const r = (apr / 100) / periodsPerYear;
      if (pmt <= p * r) {
        warningMsg = "Payment is too small to cover the interest!";
      } else {
        n = Math.ceil(-Math.log(1 - (p * r) / pmt) / Math.log(1 + r));
        totalInterest = (n * pmt) - p;
      }
    } 
    // 3. 0% interest loan fallback
    else {
      n = Math.ceil(p / pmt);
      totalInterest = 0;
    }

    const payoffDate = new Date();
    if (addForm.frequency === 'weekly') payoffDate.setDate(payoffDate.getDate() + (n * 7));
    else if (addForm.frequency === 'yearly') payoffDate.setFullYear(payoffDate.getFullYear() + n);
    else payoffDate.setMonth(payoffDate.getMonth() + n);

    // Returning a consistent object shape fixes the TypeScript error completely
    return {
      warning: warningMsg,
      payments: n,
      interest: totalInterest,
      date: payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  const smartInsight = calculatePayoff();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh]">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Loans & Debt</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Track your liabilities and payoff progress.</p>
        </div>
        <button 
          onClick={openAddDrawer}
          className="flex items-center justify-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 hover:scale-105 active:scale-95 w-full md:w-auto"
        >
          <Plus className="w-4 h-4" /> Log Liability
        </button>
      </div>

      {/* TOP ROW: Debt Overview Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 md:p-8 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 p-8 opacity-5 dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0">
            <ShieldCheck className="w-64 h-64 text-rose-500" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="w-full md:w-auto">
              <div className="flex items-center justify-between md:justify-start gap-4 mb-4">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Outstanding</p>
                <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-lg shadow-inner border border-black/5 dark:border-white/5">
                  {(["NGN", "GBP", "USD"] as const).map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setBaseCurrency(cur)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        baseCurrency === cur 
                          ? "bg-white dark:bg-slate-800 text-rose-600 shadow-sm" 
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight transition-all duration-300">
                {overviewData[baseCurrency].total}
              </h2>
            </div>
            
            <div className="flex flex-col gap-3 relative z-20">
              <div className="flex items-center gap-2 text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-[#3D0A14]/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-rose-200 dark:border-rose-500/20">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Avg Monthly Obligation</p>
                  <p className="text-sm font-bold transition-all duration-300">~{overviewData[baseCurrency].obligation}/mo</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
                <TrendingDown className="w-5 h-5" />
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Overall Debt Progress</p>
                  <p className="text-sm font-bold">22.4% Paid Off</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-center space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">High Interest Warning</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your AMEX Platinum has a 21.99% APR. Consider prioritizing this payoff.</p>
            </div>
          </div>
          <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Healthy Debt-to-Income</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your obligations are well below the 36% recommended threshold.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE LOANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loansData.map((loan) => {
          const paidAmount = loan.originalAmount - loan.currentBalance;
          const progressPercent = Math.max(0, Math.min(100, (paidAmount / loan.originalAmount) * 100));
          const freqSuffix = loan.frequency === "weekly" ? "/wk" : loan.frequency === "yearly" ? "/yr" : "/mo";

          return (
            <div key={loan.id} className="glass-panel p-6 flex flex-col group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${loan.bg} ${loan.color}`}>
                    <loan.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-brand-deep)] transition-colors">{loan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{loan.lender} • {loan.apr}% APR</p>
                  </div>
                </div>
                <button 
                  onClick={() => openManageDrawer(loan)}
                  className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Manage
                </button>
              </div>

              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Current Balance</p>
                  <h4 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {loan.currency}{formatMoney(loan.currentBalance)}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Original</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {loan.currency}{formatMoney(loan.originalAmount)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>{progressPercent.toFixed(1)}% Paid</span>
                  <span>{loan.currency}{formatMoney(paidAmount)}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${loan.fill} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Next: <strong>{loan.nextDate}</strong></span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {loan.currency}{formatMoney(loan.payment)}<span className="text-xs text-slate-500">{freqSuffix}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-4">
        <button 
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shadow-sm disabled:opacity-50"
        >
          {isLoadingMore ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : "Load More"}
        </button>
      </div>

      {/* ========================================= */}
      {/* DRAWER: ADD OR MANAGE                     */}
      {/* ========================================= */}
      
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {drawerMode === "add" ? "Log New Liability" : `${selectedLoan?.name}`}
            </h3>
            <p className="text-xs text-slate-500">
              {drawerMode === "add" ? "Add a new loan to your tracker." : "Manage payments and view history."}
            </p>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* MANAGE TABS */}
          {drawerMode === "manage" && selectedLoan && (
            <div className="flex p-1 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
              <button 
                onClick={() => setManageTab("pay")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${manageTab === "pay" ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-300"}`}
              >
                Make Payment
              </button>
              <button 
                onClick={() => setManageTab("history")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${manageTab === "history" ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-300"}`}
              >
                Payment History
              </button>
            </div>
          )}

          {/* MANAGE: PAY TAB */}
          {drawerMode === "manage" && manageTab === "pay" && selectedLoan && (
            <div className="animate-in fade-in space-y-6">
              <div className={`p-6 rounded-2xl ${selectedLoan.bg} ${selectedLoan.color} text-center`}>
                <h4 className="font-bold text-lg mb-1">Current Balance</h4>
                <p className="text-3xl font-bold">{selectedLoan.currency}{formatMoney(selectedLoan.currentBalance)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{selectedLoan.currency}</span>
                  <input type="number" defaultValue={selectedLoan.payment} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Funding Source</label>
                <select className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium">
                  <option>Naira Checking (₦2,150,000)</option>
                  <option>GBP Vault (£15,400)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">This will automatically log a debit in your Transactions ledger.</p>
              </div>
            </div>
          )}

          {/* MANAGE: HISTORY TAB */}
          {drawerMode === "manage" && manageTab === "history" && selectedLoan && (
            <div className="animate-in fade-in space-y-4">
              {selectedLoan.history.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Payment Applied</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{record.date}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedLoan.currency}{formatMoney(record.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ADD MODE UI */}
          {drawerMode === "add" && (
            <div className="animate-in fade-in space-y-5">
              
              {/* SMART INSIGHT WIDGET */}
              {smartInsight && (
                <div className={`p-4 rounded-xl border ${smartInsight.warning ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' : 'bg-[var(--color-brand-deep)]/5 dark:bg-[var(--color-brand-deep)]/10 border-[var(--color-brand-deep)]/20'}`}>
                  {smartInsight.warning ? (
                    <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold">{smartInsight.warning}</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)]">
                      <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">Smart Debt Insight</p>
                        <p className="text-xs opacity-90 leading-relaxed">
                          You will pay this off in <strong>{smartInsight.payments} {addForm.frequency} payments</strong> (around <strong>{smartInsight.date}</strong>).
                          {smartInsight.interest > 0 && ` Total interest paid will be approx ${formatMoney(smartInsight.interest)}.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Liability Name</label>
                <input type="text" placeholder="e.g. Student Loan, Auto Lease" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Original Amount</label>
                  <input type="number" value={addForm.originalAmount} onChange={(e) => setAddForm({...addForm, originalAmount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Current Balance</label>
                  <input type="number" value={addForm.currentBalance} onChange={(e) => setAddForm({...addForm, currentBalance: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>

              {/* NEW: APR and Total Repayment Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Interest Rate (APR)</label>
                  <div className="relative">
                    <input type="number" value={addForm.apr} onChange={(e) => setAddForm({...addForm, apr: e.target.value})} placeholder="0.0" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-8 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Total Repayment (Opt)</label>
                  <input type="number" value={addForm.totalRepayment} onChange={(e) => setAddForm({...addForm, totalRepayment: e.target.value})} placeholder="Overrides APR" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Payment Frequency</label>
                  <select defaultValue="monthly" onChange={(e) => setAddForm({...addForm, frequency: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Payment Amount</label>
                  <input type="number" value={addForm.payment} onChange={(e) => setAddForm({...addForm, payment: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Actions */}
        {!(drawerMode === "manage" && manageTab === "history") && (
          <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3">
            <button onClick={() => setIsDrawerOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20">
              {drawerMode === "add" ? "Save Liability" : "Confirm Payment"}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
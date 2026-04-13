"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Landmark, Plus, X, Home, Car, CreditCard, Banknote, 
  Calendar, ShieldCheck, TrendingDown, CheckCircle2, Loader2, 
  Sparkles, AlertTriangle, Eye, EyeOff, Flag, MoreHorizontal, 
  Edit3, Trash2, HeartPulse, Smartphone, GraduationCap, Building2, Users
} from "lucide-react";

import { getUserLoans, createLoan, processLoanPayment, getLoanHistory, updateLoan, deleteLoan } from "@/actions/loanActions";
import { getUserAccounts } from "@/actions/accountActions";

const EXCHANGE_RATES = { "NGN": 1, "GBP": 2000, "USD": 1600 };

type ConfirmConfig = {
  title: string;
  message: string;
  actionText: string;
  actionColor: string;
  iconColor: string;
  onConfirm: () => Promise<void> | void;
  isAlertOnly?: boolean;
};

export default function LoansPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [showAmounts, setShowAmounts] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState<"NGN" | "GBP" | "USD">("NGN");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const [loans, setLoans] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "manage" | "edit">("add");
  const [manageTab, setManageTab] = useState<"pay" | "history">("pay");
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const [paymentAmount, setPaymentAmount] = useState("");
  const [fundingAccountId, setFundingAccountId] = useState("");

  const [addForm, setAddForm] = useState({
    name: "",
    lender: "",
    originalAmount: "",
    currentBalance: "",
    apr: "",
    totalRepayment: "",
    payment: "",
    frequency: "monthly",
    type: "personal",
    currency: "NGN",
    nextDate: ""
  });

  useEffect(() => {
    if (userId) {
      loadData();
    } else if (status === "unauthenticated") {
      setIsFetching(false);
    }
  }, [userId, status]);

  const loadData = async () => {
    setIsFetching(true);
    const [loanData, accData] = await Promise.all([
        getUserLoans(userId),
        getUserAccounts(userId)
    ]);
    setLoans(loanData || []);
    
    const fundingAccounts = (accData || []).filter((a: any) => a.type === 'fiat' || a.type === 'business');
    setAccounts(fundingAccounts);
    if (fundingAccounts.length > 0) setFundingAccountId(fundingAccounts[0].id);

    setIsFetching(false);
  };

  const loadHistory = async (loanId: string) => {
      const hist = await getLoanHistory(userId, loanId);
      setHistory(hist);
  };

  const formatMoney = (amount: number) => Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const getCurrencySymbol = (code: string) => {
    if (code === "NGN") return "₦";
    if (code === "GBP") return "£";
    if (code === "USD") return "$";
    return code; 
  };

  // --- CUSTOM ALERT HELPER ---
  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setConfirmConfig({
      title,
      message,
      actionText: "Got it",
      actionColor: type === 'error' ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700",
      iconColor: type === 'error' ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      isAlertOnly: true,
      onConfirm: () => { setIsConfirmModalOpen(false); }
    });
    setIsConfirmModalOpen(true);
  };

  const getLoanIcon = (type: string) => {
      switch(type) {
          case 'mortgage': return { Icon: Home, color: "text-indigo-500", bg: "bg-indigo-500/10", fill: "bg-indigo-500" };
          case 'auto': return { Icon: Car, color: "text-blue-500", bg: "bg-blue-500/10", fill: "bg-blue-500" };
          case 'credit': return { Icon: CreditCard, color: "text-rose-500", bg: "bg-rose-500/10", fill: "bg-rose-500" };
          case 'health': return { Icon: HeartPulse, color: "text-pink-500", bg: "bg-pink-500/10", fill: "bg-pink-500" };
          case 'gadget': return { Icon: Smartphone, color: "text-purple-500", bg: "bg-purple-500/10", fill: "bg-purple-500" };
          case 'education': return { Icon: GraduationCap, color: "text-teal-500", bg: "bg-teal-500/10", fill: "bg-teal-500" };
          case 'bank': return { Icon: Building2, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-500/10", fill: "bg-slate-500" };
          case 'family': return { Icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", fill: "bg-orange-500" };
          default: return { Icon: Landmark, color: "text-amber-500", bg: "bg-amber-500/10", fill: "bg-amber-500" };
      }
  };

  const handleAprBlur = () => {
    const p = parseFloat(addForm.currentBalance) || parseFloat(addForm.originalAmount) || 0;
    const pmt = parseFloat(addForm.payment) || 0;
    const r_apr = parseFloat(addForm.apr) || 0;
    
    if (p > 0 && pmt > 0 && r_apr > 0) {
        const periodsPerYear = addForm.frequency === 'weekly' ? 52 : addForm.frequency === 'yearly' ? 1 : 12;
        const r = (r_apr / 100) / periodsPerYear;
        if (pmt > p * r) {
            const n = -Math.log(1 - (p * r) / pmt) / Math.log(1 + r);
            const tr = n * pmt;
            setAddForm(prev => ({ ...prev, totalRepayment: tr.toFixed(2) }));
        }
    }
  };

  const handleTotalRepayBlur = () => {
    const p = parseFloat(addForm.currentBalance) || parseFloat(addForm.originalAmount) || 0;
    const pmt = parseFloat(addForm.payment) || 0;
    const tr = parseFloat(addForm.totalRepayment) || 0;

    if (p > 0 && pmt > 0 && tr > p) {
        const n = tr / pmt;
        const totalInterest = tr - p;
        const periodsPerYear = addForm.frequency === 'weekly' ? 52 : addForm.frequency === 'yearly' ? 1 : 12;
        const approxApr = ((2 * periodsPerYear * totalInterest) / (p * (n + 1))) * 100;
        setAddForm(prev => ({ ...prev, apr: approxApr.toFixed(2) }));
    }
  };

  const calculateOverview = () => {
      let totalUSD = 0;
      let obligationUSD = 0;

      loans.forEach(loan => {
          const bal = parseFloat(loan.currentBalance) || 0;
          const pmt = parseFloat(loan.payment) || 0;
          
          let monthlyPmt = pmt;
          if (loan.frequency === 'weekly') monthlyPmt = pmt * 4.33;
          if (loan.frequency === 'yearly') monthlyPmt = pmt / 12;

          const toBase = (val: number, cur: string) => {
              if (cur === 'NGN') return val / EXCHANGE_RATES.USD;
              if (cur === 'GBP') return val * (EXCHANGE_RATES.GBP / EXCHANGE_RATES.USD);
              return val;
          };

          totalUSD += toBase(bal, loan.currency);
          obligationUSD += toBase(monthlyPmt, loan.currency);
      });

      const toView = (usdVal: number) => {
          if (baseCurrency === 'NGN') return usdVal * EXCHANGE_RATES.USD;
          if (baseCurrency === 'GBP') return usdVal / (EXCHANGE_RATES.GBP / EXCHANGE_RATES.USD);
          return usdVal;
      };

      const totalPaid = loans.reduce((acc, l) => acc + (parseFloat(l.originalAmount) - parseFloat(l.currentBalance)), 0);
      const totalOriginal = loans.reduce((acc, l) => acc + parseFloat(l.originalAmount), 0);
      const progress = totalOriginal > 0 ? ((totalPaid / totalOriginal) * 100).toFixed(1) : "0.0";

      return {
          total: `${getCurrencySymbol(baseCurrency)}${formatMoney(toView(totalUSD))}`,
          obligation: `${getCurrencySymbol(baseCurrency)}${formatMoney(toView(obligationUSD))}`,
          progress: `${progress}% Paid Off`
      };
  };
  const overviewData = calculateOverview();

  const getPayoffDetails = (balance: number|string, payment: number|string, apr: number|string, totalRepay: number|string, freq: string, startDateStr: string) => {
    const p = parseFloat(balance as string) || 0;
    const pmt = parseFloat(payment as string) || 0;
    const r_apr = parseFloat(apr as string) || 0;
    const tr = parseFloat(totalRepay as string) || 0;

    if (p <= 0 || pmt <= 0) return null;

    let n = 0;
    let totalInterest = 0;
    const periodsPerYear = freq === 'weekly' ? 52 : freq === 'yearly' ? 1 : 12;
    let warningMsg = "";

    if (tr > p) {
      n = Math.ceil(tr / pmt);
      totalInterest = Math.max(0, tr - p);
    } else if (r_apr > 0) {
      const r = (r_apr / 100) / periodsPerYear;
      if (pmt <= p * r) {
        warningMsg = "Payment is too small to cover the interest!";
      } else {
        n = Math.ceil(-Math.log(1 - (p * r) / pmt) / Math.log(1 + r));
        totalInterest = (n * pmt) - p;
      }
    } else {
      n = Math.ceil(p / pmt);
      totalInterest = 0;
    }

    const payoffDate = startDateStr ? new Date(startDateStr) : new Date();
    if (freq === 'weekly') payoffDate.setDate(payoffDate.getDate() + (n * 7));
    else if (freq === 'yearly') payoffDate.setFullYear(payoffDate.getFullYear() + n);
    else payoffDate.setMonth(payoffDate.getMonth() + n);

    return {
      warning: warningMsg,
      payments: n,
      interest: totalInterest,
      date: payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  };

  const smartInsight = getPayoffDetails(addForm.currentBalance || addForm.originalAmount, addForm.payment, addForm.apr, addForm.totalRepayment, addForm.frequency, addForm.nextDate);

  const openAddDrawer = () => {
    setDrawerMode("add");
    setSelectedLoan(null);
    setAddForm({ name: "", lender: "", originalAmount: "", currentBalance: "", apr: "", totalRepayment: "", payment: "", frequency: "monthly", type: "personal", currency: "NGN", nextDate: "" });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (loan: any) => {
    setDrawerMode("edit");
    setSelectedLoan(loan);
    setAddForm({ 
        name: loan.name, 
        lender: loan.lender || "", 
        originalAmount: loan.originalAmount, 
        currentBalance: loan.currentBalance, 
        apr: loan.apr, 
        totalRepayment: loan.totalRepayment || "", 
        payment: loan.payment, 
        frequency: loan.frequency, 
        type: loan.type, 
        currency: loan.currency, 
        nextDate: loan.nextDate || "" 
    });
    setIsDrawerOpen(true);
  };

  const openManageDrawer = (loan: any) => {
    setDrawerMode("manage");
    setManageTab("pay");
    setSelectedLoan(loan);
    setPaymentAmount(loan.payment);
    setIsDrawerOpen(true);
    loadHistory(loan.id);
  };

  const handleSaveLoan = async () => {
      if (!addForm.name || !addForm.originalAmount || !addForm.payment) {
          return showAlert("Missing Information", "Please fill in the Name, Amount, and Payment fields.");
      }
      setIsSubmitting(true);
      
      let result;
      if (drawerMode === "add") {
        result = await createLoan({ ...addForm, userId });
      } else {
        result = await updateLoan({ ...addForm, loanId: selectedLoan.id, userId });
      }

      if (result.success) {
          await loadData();
          setIsDrawerOpen(false);
          showAlert("Success", `Liability successfully ${drawerMode === 'add' ? 'logged' : 'updated'}.`, "success");
      } else {
          showAlert("Action Failed", result.error);
      }
      setIsSubmitting(false);
  };

  const handleDeleteLoan = () => {
    if (!selectedLoan) return;
    setConfirmConfig({
      title: "Delete Liability",
      message: `Are you sure you want to permanently delete this loan? This will remove it from your tracker.`,
      actionText: "Delete Liability",
      actionColor: "bg-rose-600 hover:bg-rose-700",
      iconColor: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      isAlertOnly: false,
      onConfirm: async () => {
        const result = await deleteLoan(selectedLoan.id, userId);
        if (result.success) {
          await loadData(); 
          setIsDrawerOpen(false);
          setIsConfirmModalOpen(false);
        } else {
          showAlert("Error", "Error deleting liability: " + result.error);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleMakePayment = async () => {
      if (!fundingAccountId) return showAlert("Funding Source Required", "Please select an account to pay from.");
      if (!paymentAmount || parseFloat(paymentAmount) <= 0) return showAlert("Invalid Amount", "Please enter a valid payment amount.");
      
      setIsSubmitting(true);
      const result = await processLoanPayment({
          userId,
          loanId: selectedLoan.id,
          accountId: fundingAccountId,
          amount: parseFloat(paymentAmount)
      });

      if (result.success) {
          await loadData();
          setIsDrawerOpen(false);
          showAlert("Payment Successful", "Your ledger has been updated.", "success");
      } else {
          showAlert("Payment Failed", result.error);
      }
      setIsSubmitting(false);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-brand-deep)]" />
        <p className="text-sm font-semibold">Calculating liabilities...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh] pb-24">
        
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Outstanding</p>
                    <button 
                      onClick={() => setShowAmounts(!showAmounts)} 
                      className="text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors p-1"
                      title={showAmounts ? "Hide amounts" : "Show amounts"}
                    >
                      {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

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
                  {showAmounts ? overviewData.total : "••••••"}
                </h2>
              </div>
              
              <div className="flex flex-col gap-3 relative z-20">
                <div className="flex items-center gap-2 text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-[#3D0A14]/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-rose-200 dark:border-rose-500/20">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Avg Monthly Obligation</p>
                    <p className="text-sm font-bold transition-all duration-300">
                      {showAmounts ? `~${overviewData.obligation}/mo` : "••••••"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
                  <TrendingDown className="w-5 h-5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Overall Debt Progress</p>
                    <p className="text-sm font-bold">{overviewData.progress}</p>
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
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Debt Management</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You are currently managing {loans.length} active liabilities.</p>
              </div>
            </div>
            <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Unified Ledger</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Payments made here automatically update your main accounts.</p>
              </div>
            </div>
          </div>
        </div>

        {loans.length === 0 ? (
            <div className="glass-panel flex flex-col items-center justify-center py-20 text-slate-500 text-center">
              <Landmark className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Liabilities</h3>
              <p className="text-sm max-w-sm mb-6">You haven't logged any loans, mortgages, or credit debt yet.</p>
              <button onClick={openAddDrawer} className="text-[var(--color-brand-deep)] font-bold hover:underline">
                + Log your first liability
              </button>
            </div>
        ) : (
          /* ACTIVE LOANS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loans.map((loan) => {
              const original = parseFloat(loan.originalAmount);
              const current = parseFloat(loan.currentBalance);
              const paidAmount = Math.max(0, original - current);
              const progressPercent = Math.max(0, Math.min(100, (paidAmount / original) * 100));
              const freqSuffix = loan.frequency === "weekly" ? "/wk" : loan.frequency === "yearly" ? "/yr" : "/mo";
              const { Icon, color, bg, fill } = getLoanIcon(loan.type);
              const sym = getCurrencySymbol(loan.currency);
              
              const cardInsight = getPayoffDetails(loan.currentBalance, loan.payment, loan.apr, loan.totalRepayment, loan.frequency, loan.nextDate);

              return (
                <div key={loan.id} className="glass-panel p-6 flex flex-col group relative overflow-hidden">
                  
                  {/* DROPDOWN MENU */}
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === loan.id ? null : loan.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 transition-all cursor-pointer"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {openMenuId === loan.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 py-1">
                          <button onClick={() => { openEditDrawer(loan); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <Edit3 className="w-4 h-4 text-slate-400" /> Edit Details
                          </button>
                          <button onClick={() => { setSelectedLoan(loan); handleDeleteLoan(); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-slate-100 dark:border-white/5">
                            <Trash2 className="w-4 h-4" /> Delete Liability
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-6 pr-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-brand-deep)] transition-colors truncate max-w-[180px]">{loan.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{loan.lender} • {loan.apr}% APR</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Current Balance</p>
                      <h4 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {showAmounts ? `${sym}${formatMoney(current)}` : "••••••"}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Original</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {showAmounts ? `${sym}${formatMoney(original)}` : "••••••"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 mt-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span>{progressPercent.toFixed(1)}% Paid</span>
                      <span>{showAmounts ? `${sym}${formatMoney(paidAmount)}` : "••••••"}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${fill} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-xs">Next: <strong>{loan.nextDate ? new Date(loan.nextDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : "Unscheduled"}</strong></span>
                      </div>
                      {cardInsight && !cardInsight.warning && (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                              <Flag className="w-4 h-4 opacity-70" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Est. Payoff: {cardInsight.date}</span>
                          </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 dark:text-white text-right">
                          {showAmounts ? (
                          <>{sym}{formatMoney(parseFloat(loan.payment))}<span className="text-xs text-slate-500">{freqSuffix}</span></>
                          ) : "••••••"}
                      </span>
                      <button 
                        onClick={() => openManageDrawer(loan)}
                        className="bg-slate-100 dark:bg-white/5 hover:bg-[var(--color-brand-deep)] hover:text-white text-[var(--color-brand-deep)] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================= */}
      {/* DRAWER & MODALS OUTSIDE ANIMATE-IN FIX    */}
      {/* ========================================= */}
      
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => !isSubmitting && setIsDrawerOpen(false)}
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
              {drawerMode === "add" ? "Log New Liability" : drawerMode === "edit" ? "Edit Liability Details" : `${selectedLoan?.name}`}
            </h3>
            <p className="text-xs text-slate-500">
              {drawerMode === "add" ? "Add a new loan to your tracker." : drawerMode === "edit" ? "Update your loan parameters." : "Manage payments and view history."}
            </p>
          </div>
          <button onClick={() => !isSubmitting && setIsDrawerOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
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

          {drawerMode === "manage" && manageTab === "pay" && selectedLoan && (
            <div className="animate-in fade-in space-y-6">
              <div className={`p-6 rounded-2xl ${getLoanIcon(selectedLoan.type).bg} ${getLoanIcon(selectedLoan.type).color} text-center`}>
                <h4 className="font-bold text-lg mb-1">Current Balance</h4>
                <p className="text-3xl font-bold">{getCurrencySymbol(selectedLoan.currency)}{formatMoney(selectedLoan.currentBalance)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{getCurrencySymbol(selectedLoan.currency)}</span>
                  <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Funding Source</label>
                <select value={fundingAccountId} onChange={(e) => setFundingAccountId(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium disabled:opacity-50">
                  {accounts.length === 0 && <option value="">No checking accounts found...</option>}
                  {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({getCurrencySymbol(acc.currency)}{formatMoney(acc.balance)})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">This will automatically deduct funds and log a receipt in your Ledger.</p>
              </div>
            </div>
          )}

          {drawerMode === "manage" && manageTab === "history" && selectedLoan && (
            <div className="animate-in fade-in space-y-4">
              {history.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-10">No payments recorded yet.</p>
              ) : (
                  history.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Payment Applied</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{record.date.split(' ')[0]}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {getCurrencySymbol(selectedLoan.currency)}{formatMoney(record.amount)}
                      </span>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* ADD / EDIT MODE UI */}
          {(drawerMode === "add" || drawerMode === "edit") && (
            <div className="animate-in fade-in space-y-5">
              
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
                          {smartInsight.interest > 0 && ` Total interest paid will be approx ${getCurrencySymbol(addForm.currency)}${formatMoney(smartInsight.interest)}.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Liability Name</label>
                <input type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} disabled={isSubmitting} placeholder="e.g. Student Loan, Auto Lease" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Type</label>
                  <select value={addForm.type} onChange={e => setAddForm({...addForm, type: e.target.value})} disabled={isSubmitting} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none disabled:opacity-50">
                    <option value="mortgage">Mortgage</option>
                    <option value="auto">Auto Loan</option>
                    <option value="credit">Credit Card</option>
                    <option value="health">Medical / Health</option>
                    <option value="gadget">Phone / Gadgets</option>
                    <option value="education">Student Loan</option>
                    <option value="bank">Bank Loan</option>
                    <option value="family">Family / Friends</option>
                    <option value="personal">Personal / Biz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Lender (Opt)</label>
                  <input type="text" value={addForm.lender} onChange={e => setAddForm({...addForm, lender: e.target.value})} disabled={isSubmitting} placeholder="e.g. Zenith Bank" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Currency</label>
                <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                  {["NGN", "GBP", "USD"].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setAddForm({...addForm, currency: cur})}
                      disabled={isSubmitting}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-50 ${
                        addForm.currency === cur 
                          ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" 
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Original Amount</label>
                  <input type="number" value={addForm.originalAmount} onChange={(e) => setAddForm({...addForm, originalAmount: e.target.value, currentBalance: drawerMode === 'add' ? e.target.value : addForm.currentBalance})} disabled={isSubmitting} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Current Balance</label>
                  <input type="number" value={addForm.currentBalance} onChange={(e) => setAddForm({...addForm, currentBalance: e.target.value})} disabled={isSubmitting} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Interest Rate (APR)</label>
                  <div className="relative">
                    <input type="number" value={addForm.apr} onBlur={handleAprBlur} onChange={(e) => setAddForm({...addForm, apr: e.target.value})} disabled={isSubmitting} placeholder="0.0" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-8 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Total Repayment (Opt)</label>
                  <input type="number" value={addForm.totalRepayment} onBlur={handleTotalRepayBlur} onChange={(e) => setAddForm({...addForm, totalRepayment: e.target.value})} disabled={isSubmitting} placeholder="Auto-calculates" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 text-sm disabled:opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Payment Frequency</label>
                  <select value={addForm.frequency} onChange={(e) => setAddForm({...addForm, frequency: e.target.value})} disabled={isSubmitting} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium disabled:opacity-50">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Payment Amount</label>
                  <input type="number" value={addForm.payment} onBlur={() => { handleAprBlur(); handleTotalRepayBlur(); }} onChange={(e) => setAddForm({...addForm, payment: e.target.value})} disabled={isSubmitting} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Next Payment Date</label>
                <input type="date" value={addForm.nextDate} onChange={(e) => setAddForm({...addForm, nextDate: e.target.value})} disabled={isSubmitting} className="w-full min-w-full block appearance-none min-h-[50px] bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Actions */}
        {!(drawerMode === "manage" && manageTab === "history") && (
          <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3">
            <button onClick={() => setIsDrawerOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button 
                onClick={drawerMode === "add" || drawerMode === "edit" ? handleSaveLoan : handleMakePayment}
                disabled={isSubmitting || (drawerMode === 'manage' && accounts.length === 0)} 
                className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {drawerMode === "add" ? "Save Liability" : drawerMode === "edit" ? "Update Details" : "Confirm Payment"}
            </button>
          </div>
        )}
      </div>

      {/* CONFIRMATION / ALERT MODAL */}
      {isConfirmModalOpen && confirmConfig && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => !isConfirming && setIsConfirmModalOpen(false)} 
          />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full mb-4 flex items-center justify-center ${confirmConfig.iconColor}`}>
                {confirmConfig.isAlertOnly && confirmConfig.actionColor.includes("emerald") ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {confirmConfig.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                {confirmConfig.message}
              </p>
              <div className="flex gap-3 w-full">
                {!confirmConfig.isAlertOnly && (
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    disabled={isConfirming}
                    className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={async () => {
                    setIsConfirming(true);
                    await confirmConfig.onConfirm();
                    setIsConfirming(false);
                    if (confirmConfig.isAlertOnly) setIsConfirmModalOpen(false);
                  }}
                  disabled={isConfirming}
                  className={`flex-1 py-3 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${confirmConfig.actionColor}`}
                >
                  {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isConfirming ? "Processing..." : confirmConfig.actionText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Target, Plus, X, Home, Car, Plane, PiggyBank, 
  TrendingUp, Calendar, CheckCircle2, Sparkles, PlusCircle, 
  Eye, EyeOff, Trash2, Loader2, MoreHorizontal, Edit3, AlertTriangle,
  Briefcase, Building, Users, User, GraduationCap, Smartphone
} from "lucide-react";

import { getUserGoals, createGoal, updateGoal, deleteGoal, fundGoal } from "@/actions/goalActions";
import { getUserAccounts } from "@/actions/accountActions";
import { getLiveExchangeRates } from "@/actions/currencyActions";

type ConfirmConfig = {
  title: string;
  message: string;
  actionText: string;
  actionColor: string;
  iconColor: string;
  onConfirm: () => Promise<void> | void;
  isAlertOnly?: boolean;
};

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [showAmounts, setShowAmounts] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState<"₦" | "£" | "$">("₦");
  
  const [goals, setGoals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [liveRates, setLiveRates] = useState<any>(null);
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | "fund">("add");
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const [fundAmount, setFundAmount] = useState("");
  const [fundingAccountId, setFundingAccountId] = useState("");

  const [addForm, setAddForm] = useState({
    name: "",
    category: "Safety",
    currencySymbol: "₦",
    targetAmount: "",
    currentAmount: "",
    targetDate: ""
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
    const [goalData, accData, rateData] = await Promise.all([
        getUserGoals(userId),
        getUserAccounts(userId),
        getLiveExchangeRates()
    ]);
    
    setGoals(goalData || []);
    
    const fundingAccounts = (accData || []).filter((a: any) => a.type === 'fiat' || a.type === 'business');
    setAccounts(fundingAccounts);
    if (fundingAccounts.length > 0) setFundingAccountId(fundingAccounts[0].id);

    if (rateData.success) {
        setLiveRates(rateData.rates);
    } else {
        setLiveRates({ NGN: 1200, GBP: 0.79, USD: 1 }); 
    }

    setIsFetching(false);
  };

  const formatMoney = (amount: number) => Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  
  // FIX: Re-added the missing currency symbol helper for the Funding dropdown
  const getCurrencySymbol = (code: string) => {
    if (code === "NGN") return "₦";
    if (code === "GBP") return "£";
    if (code === "USD") return "$";
    return code; 
  };

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setConfirmConfig({
      title, message,
      actionText: "Got it",
      actionColor: type === 'error' ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700",
      iconColor: type === 'error' ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      isAlertOnly: true,
      onConfirm: () => { setIsConfirmModalOpen(false); }
    });
    setIsConfirmModalOpen(true);
  };

  // EXPANDED CATEGORY MAPPING
  const getGoalIcon = (category: string) => {
    switch(category) {
        case 'Safety': return { Icon: PiggyBank, color: "text-emerald-500", bg: "bg-emerald-500/10", fill: "bg-emerald-500" };
        case 'Real Estate': return { Icon: Home, color: "text-indigo-500", bg: "bg-indigo-500/10", fill: "bg-indigo-500" };
        case 'Travel': return { Icon: Plane, color: "text-sky-500", bg: "bg-sky-500/10", fill: "bg-sky-500" };
        case 'Vehicle': return { Icon: Car, color: "text-orange-500", bg: "bg-orange-500/10", fill: "bg-orange-500" };
        case 'Relocation': return { Icon: Plane, color: "text-rose-500", bg: "bg-rose-500/10", fill: "bg-rose-500" };
        case 'Career': return { Icon: Briefcase, color: "text-blue-600", bg: "bg-blue-500/10", fill: "bg-blue-600" };
        case 'Business': return { Icon: Building, color: "text-amber-600", bg: "bg-amber-500/10", fill: "bg-amber-600" };
        case 'Family': return { Icon: Users, color: "text-pink-500", bg: "bg-pink-500/10", fill: "bg-pink-500" };
        case 'Personal': return { Icon: User, color: "text-teal-500", bg: "bg-teal-500/10", fill: "bg-teal-500" };
        case 'Education': return { Icon: GraduationCap, color: "text-cyan-500", bg: "bg-cyan-500/10", fill: "bg-cyan-500" };
        case 'Investments': return { Icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10", fill: "bg-violet-500" };
        case 'Gadgets': return { Icon: Smartphone, color: "text-slate-500", bg: "bg-slate-500/10", fill: "bg-slate-500" };
        default: return { Icon: Target, color: "text-[var(--color-brand-deep)]", bg: "bg-[var(--color-brand-deep)]/10", fill: "bg-[var(--color-brand-deep)]" };
    }
  };

  const activeGoals = goals.filter(g => g.currencySymbol === baseCurrency);

  const totalTarget = activeGoals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0);
  const totalSaved = activeGoals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const openAddDrawer = () => {
    setDrawerMode("add");
    setSelectedGoal(null);
    setAddForm({ name: "", category: "Safety", currencySymbol: baseCurrency, targetAmount: "", currentAmount: "", targetDate: "" });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (goal: any) => {
    setDrawerMode("edit");
    setSelectedGoal(goal);
    setAddForm({ 
        name: goal.name, 
        category: goal.category, 
        currencySymbol: goal.currencySymbol, 
        targetAmount: goal.targetAmount, 
        currentAmount: goal.currentAmount, 
        targetDate: goal.targetDate 
    });
    setIsDrawerOpen(true);
  };

  const openFundDrawer = (goal: any) => {
    setDrawerMode("fund");
    setSelectedGoal(goal);
    setFundAmount("");
    setIsDrawerOpen(true);
  };

  const handleSaveGoal = async () => {
    if (!addForm.name || !addForm.targetAmount || !addForm.targetDate) {
        return showAlert("Missing Information", "Please fill in the Name, Target Amount, and Target Date.");
    }
    setIsSubmitting(true);
    
    let result;
    if (drawerMode === "add") {
      result = await createGoal({ ...addForm, userId });
    } else {
      result = await updateGoal({ ...addForm, goalId: selectedGoal.id, userId });
    }

    if (result.success) {
        await loadData();
        setIsDrawerOpen(false);
        showAlert("Success", `Milestone successfully ${drawerMode === 'add' ? 'created' : 'updated'}.`, "success");
    } else {
        showAlert("Action Failed", result.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteGoal = () => {
    if (!selectedGoal) return;
    setConfirmConfig({
      title: "Delete Milestone",
      message: `Are you sure you want to permanently delete this milestone?`,
      actionText: "Delete Milestone",
      actionColor: "bg-rose-600 hover:bg-rose-700",
      iconColor: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      isAlertOnly: false,
      onConfirm: async () => {
        const result = await deleteGoal(selectedGoal.id, userId);
        if (result.success) {
          await loadData(); 
          setIsDrawerOpen(false);
          setIsConfirmModalOpen(false);
        } else {
          showAlert("Error", "Error deleting milestone: " + result.error);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleFundGoal = async () => {
    if (!fundingAccountId) return showAlert("Funding Source Required", "Please select an account to pay from.");
    if (!fundAmount || parseFloat(fundAmount) <= 0) return showAlert("Invalid Amount", "Please enter a valid funding amount.");
    
    setIsSubmitting(true);
    const result = await fundGoal({
        userId,
        goalId: selectedGoal.id,
        accountId: fundingAccountId,
        amount: parseFloat(fundAmount)
    });

    if (result.success) {
        await loadData();
        setIsDrawerOpen(false);
        showAlert("Goal Funded!", "Your funds have been securely allocated.", "success");
    } else {
        showAlert("Funding Failed", result.error);
    }
    setIsSubmitting(false);
  };

  const calculateSavingsPlan = () => {
    const target = parseFloat(addForm.targetAmount) || 0;
    const current = parseFloat(addForm.currentAmount) || 0;
    const dateStr = addForm.targetDate;

    if (target <= 0 || !dateStr) return null;
    
    const remaining = target - current;
    if (remaining <= 0) return { complete: true, warning: "", monthly: 0, months: 0 };

    const targetDate = new Date(dateStr);
    const today = new Date();
    
    let months = (targetDate.getFullYear() - today.getFullYear()) * 12;
    months -= today.getMonth();
    months += targetDate.getMonth();

    if (months <= 0) return { complete: false, warning: "Target date must be in the future!", monthly: 0, months: 0 };

    return { complete: false, warning: "", monthly: remaining / months, months: months };
  };

  const smartInsight = calculateSavingsPlan();

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-brand-deep)]" />
        <p className="text-sm font-semibold">Loading milestones...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh] pb-24">
        
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Milestones</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Set targets and track your savings progress.</p>
          </div>
          <button 
            onClick={openAddDrawer}
            className="flex items-center justify-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 hover:scale-105 active:scale-95 w-full md:w-auto"
          >
            <Target className="w-4 h-4" /> Create Milestone
          </button>
        </div>

        {/* TOP ROW: Overall Progress Hero */}
        <div className="glass-panel p-6 md:p-8 relative overflow-hidden group border-t-4 border-t-[var(--color-brand-deep)]">
          <div className="absolute -top-10 -right-10 p-8 opacity-5 dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0">
            <TrendingUp className="w-64 h-64 text-[var(--color-brand-deep)]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Savings Allocated</p>
                <button 
                  onClick={() => setShowAmounts(!showAmounts)} 
                  className="text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors p-1"
                  title={showAmounts ? "Hide amounts" : "Show amounts"}
                >
                  {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-lg shadow-inner border border-black/5 dark:border-white/5">
                {(["₦", "£", "$"] as const).map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setBaseCurrency(sym)}
                    className={`px-4 py-1 text-sm font-bold rounded-md transition-all ${
                      baseCurrency === sym 
                        ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
                {showAmounts ? `${baseCurrency}${formatMoney(totalSaved)}` : "••••••"}
              </h2>
              <div className="text-left md:text-right">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Target</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  {showAmounts ? `${baseCurrency}${formatMoney(totalTarget)}` : "••••••"}
                </p>
              </div>
            </div>

            {/* LIVE MARKET RATES INDICATOR */}
            {liveRates && (
              <div className="flex items-center gap-4 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-6 bg-emerald-50 dark:bg-emerald-500/10 w-max px-2.5 py-1 rounded-md">
                 <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3"/> $1 = ₦{formatMoney(liveRates.NGN)}</span>
                 <span className="flex items-center gap-1">£1 = ₦{formatMoney(liveRates.NGN / liveRates.GBP)}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)]">
                <span>Overall Completion</span>
                <span>{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--color-brand-deep)] to-[var(--color-brand-light)] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* MILESTONES GRID */}
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map((goal) => {
              const current = parseFloat(goal.currentAmount);
              const target = parseFloat(goal.targetAmount);
              const progressPercent = Math.max(0, Math.min(100, (current / target) * 100));
              const isCompleted = progressPercent >= 100;
              const { Icon, color, bg, fill } = getGoalIcon(goal.category);

              return (
                <div key={goal.id} className={`glass-panel p-6 flex flex-col group relative overflow-hidden transition-all ${isCompleted ? 'border-emerald-500/50 dark:border-emerald-500/30 shadow-emerald-500/10' : ''}`}>
                  
                  {/* DROPDOWN MENU */}
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === goal.id ? null : goal.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 transition-all cursor-pointer"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {openMenuId === goal.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 py-1">
                          <button onClick={() => { openEditDrawer(goal); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <Edit3 className="w-4 h-4 text-slate-400" /> Edit Milestone
                          </button>
                          <button onClick={() => { setSelectedGoal(goal); handleDeleteGoal(); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-slate-100 dark:border-white/5">
                            <Trash2 className="w-4 h-4" /> Delete Milestone
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-6 pr-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : `${bg} ${color}`}`}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-brand-deep)] transition-colors truncate max-w-[180px]">{goal.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{goal.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Saved</p>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {showAmounts ? `${goal.currencySymbol}${formatMoney(current)}` : "••••••"}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Target</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {showAmounts ? `${goal.currencySymbol}${formatMoney(target)}` : "••••••"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span>{progressPercent.toFixed(1)}% Complete</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isCompleted ? 'bg-emerald-500' : fill} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Target: <strong>{new Date(goal.targetDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</strong></span>
                    </div>
                    {isCompleted ? (
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Achieved!</span>
                    ) : (
                      <button 
                        onClick={() => openFundDrawer(goal)}
                        className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 hover:bg-[var(--color-brand-deep)] hover:text-white text-[var(--color-brand-deep)] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Fund
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200 dark:border-white/10">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active {baseCurrency} milestones</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">Create a new milestone to start tracking your financial goals in this currency.</p>
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
              {drawerMode === "add" ? "Create Milestone" : drawerMode === "edit" ? "Edit Milestone" : `Fund ${selectedGoal?.name}`}
            </h3>
            <p className="text-xs text-slate-500">
              {drawerMode === "add" ? "Set a new target to work towards." : drawerMode === "edit" ? "Update your goal parameters." : "Allocate savings to this goal."}
            </p>
          </div>
          <button onClick={() => !isSubmitting && setIsDrawerOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* FUND MODE UI */}
          {drawerMode === "fund" && selectedGoal && (
            <div className="animate-in fade-in space-y-6">
              <div className={`p-6 rounded-2xl ${getGoalIcon(selectedGoal.category).bg} ${getGoalIcon(selectedGoal.category).color} text-center`}>
                <h4 className="font-bold text-lg mb-1">{selectedGoal.name}</h4>
                <p className="text-sm font-bold opacity-80">Remaining: {selectedGoal.currencySymbol}{formatMoney(selectedGoal.targetAmount - selectedGoal.currentAmount)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Amount to Allocate</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{selectedGoal.currencySymbol}</span>
                  <input type="number" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} disabled={isSubmitting} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
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

          {/* ADD / EDIT MODE UI */}
          {(drawerMode === "add" || drawerMode === "edit") && (
            <div className="animate-in fade-in space-y-5">
              
              {/* SMART INSIGHT WIDGET */}
              {smartInsight && (
                <div className={`p-4 rounded-xl border ${smartInsight.warning ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' : 'bg-[var(--color-brand-deep)]/5 dark:bg-[var(--color-brand-deep)]/10 border-[var(--color-brand-deep)]/20'}`}>
                  {smartInsight.complete ? (
                    <div className="flex items-start gap-3 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold">Goal already reached!</p>
                    </div>
                  ) : smartInsight.warning ? (
                    <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold">{smartInsight.warning}</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)]">
                      <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">Smart Savings Plan</p>
                        <p className="text-xs opacity-90 leading-relaxed">
                          To hit this target in <strong>{smartInsight.months} months</strong>, you need to save <strong>{addForm.currencySymbol}{formatMoney(smartInsight.monthly)} every month</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-[1fr_auto] gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Milestone Name</label>
                  <input type="text" value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} disabled={isSubmitting} placeholder="e.g. Maldives Trip" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Currency</label>
                  <select 
                    value={addForm.currencySymbol}
                    onChange={(e) => setAddForm({...addForm, currencySymbol: e.target.value})}
                    disabled={isSubmitting}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-bold disabled:opacity-50"
                  >
                    <option value="₦">₦</option>
                    <option value="£">£</option>
                    <option value="$">$</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Category</label>
                <select value={addForm.category} onChange={(e) => setAddForm({...addForm, category: e.target.value})} disabled={isSubmitting} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none disabled:opacity-50">
                  <option value="Safety">Safety & Emergency</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Travel">Travel</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Relocation">Relocation</option>
                  <option value="Career">Career & Dev</option>
                  <option value="Business">Business</option>
                  <option value="Family">Family / Kids</option>
                  <option value="Personal">Personal</option>
                  <option value="Education">Education</option>
                  <option value="Investments">Investments</option>
                  <option value="Gadgets">Gadgets / Tech</option>
                  <option value="General">General Savings</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{addForm.currencySymbol}</span>
                    <input type="number" value={addForm.targetAmount} onChange={(e) => setAddForm({...addForm, targetAmount: e.target.value})} disabled={isSubmitting} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Starting Balance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{addForm.currencySymbol}</span>
                    <input type="number" value={addForm.currentAmount} onChange={(e) => setAddForm({...addForm, currentAmount: e.target.value})} disabled={isSubmitting} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Target Completion Date</label>
                <input type="date" value={addForm.targetDate} onChange={(e) => setAddForm({...addForm, targetDate: e.target.value})} disabled={isSubmitting} className="w-full min-w-full block appearance-none min-h-[50px] bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 disabled:opacity-50" />
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3 items-center">
          <button onClick={() => setIsDrawerOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button 
              onClick={drawerMode === "add" || drawerMode === "edit" ? handleSaveGoal : handleFundGoal}
              disabled={isSubmitting || (drawerMode === 'fund' && accounts.length === 0)} 
              className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {drawerMode === "add" ? "Save Goal" : drawerMode === "edit" ? "Update Details" : "Allocate Funds"}
          </button>
        </div>
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
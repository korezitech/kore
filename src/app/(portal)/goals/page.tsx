"use client";

import { useState } from "react";
import { 
  Target, Plus, X, Home, Car, Plane, PiggyBank, 
  TrendingUp, Calendar, CheckCircle2, Sparkles, PlusCircle, Eye, EyeOff, Trash2
} from "lucide-react";

// Dummy Data updated to include different currencies
const goalsData = [
  { id: 1, name: "Emergency Fund", category: "Safety", currencySymbol: "₦", target: 10000000, current: 6500000, targetDate: "Dec 31, 2026", icon: PiggyBank, color: "text-emerald-500", bg: "bg-emerald-500/10", fill: "bg-emerald-500" },
  { id: 2, name: "House Deposit", category: "Real Estate", currencySymbol: "₦", target: 50000000, current: 12000000, targetDate: "Jun 01, 2028", icon: Home, color: "text-indigo-500", bg: "bg-indigo-500/10", fill: "bg-indigo-500" },
  { id: 3, name: "Maldives Vacation", category: "Travel", currencySymbol: "$", target: 4500, current: 4500, targetDate: "Aug 15, 2026", icon: Plane, color: "text-blue-500", bg: "bg-blue-500/10", fill: "bg-blue-500" },
  { id: 4, name: "London Relocation", category: "Relocation", currencySymbol: "£", target: 25000, current: 2000, targetDate: "Feb 01, 2027", icon: Plane, color: "text-rose-500", bg: "bg-rose-500/10", fill: "bg-rose-500" }
];

export default function GoalsPage() {
  const [showAmounts, setShowAmounts] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState<"₦" | "£" | "$">("₦");
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "fund">("add");
  const [selectedGoal, setSelectedGoal] = useState<typeof goalsData[0] | null>(null);

  // Add Goal Form State
  const [addForm, setAddForm] = useState({
    name: "",
    currency: "₦",
    targetAmount: "",
    currentAmount: "",
    targetDate: ""
  });

  const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Filter goals by the selected currency
  const activeGoals = goalsData.filter(g => g.currencySymbol === baseCurrency);

  // Calculate totals based ONLY on the active currency view
  const totalTarget = activeGoals.reduce((sum, goal) => sum + goal.target, 0);
  const totalSaved = activeGoals.reduce((sum, goal) => sum + goal.current, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const openAddDrawer = () => {
    setDrawerMode("add");
    setSelectedGoal(null);
    setAddForm({ name: "", currency: baseCurrency, targetAmount: "", currentAmount: "", targetDate: "" });
    setIsDrawerOpen(true);
  };

  const openFundDrawer = (goal: typeof goalsData[0]) => {
    setDrawerMode("fund");
    setSelectedGoal(goal);
    setIsDrawerOpen(true);
  };

  // --- SMART SAVINGS CALCULATOR ---
  const calculateSavingsPlan = () => {
    const target = parseFloat(addForm.targetAmount) || 0;
    const current = parseFloat(addForm.currentAmount) || 0;
    const dateStr = addForm.targetDate;

    if (target <= 0 || !dateStr) return null;
    
    const remaining = target - current;
    
    if (remaining <= 0) {
      return { complete: true, warning: "", monthly: 0, months: 0 };
    }

    const targetDate = new Date(dateStr);
    const today = new Date();
    
    let months = (targetDate.getFullYear() - today.getFullYear()) * 12;
    months -= today.getMonth();
    months += targetDate.getMonth();

    if (months <= 0) {
      return { complete: false, warning: "Target date must be in the future!", monthly: 0, months: 0 };
    }

    const monthlyRequired = remaining / months;

    return {
      complete: false,
      warning: "",
      monthly: monthlyRequired,
      months: months
    };
  };

  const smartInsight = calculateSavingsPlan();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh]">
      
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
            
            {/* Privacy Toggle */}
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

            {/* Currency Symbol Switcher */}
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

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
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
            const progressPercent = Math.max(0, Math.min(100, (goal.current / goal.target) * 100));
            const isCompleted = progressPercent >= 100;

            return (
              <div key={goal.id} className={`glass-panel p-6 flex flex-col group relative overflow-hidden transition-all ${isCompleted ? 'border-emerald-500/50 dark:border-emerald-500/30 shadow-emerald-500/10' : ''}`}>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : `${goal.bg} ${goal.color}`}`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <goal.icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-brand-deep)] transition-colors">{goal.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{goal.category}</p>
                    </div>
                  </div>
                  {!isCompleted && (
                    <button 
                      onClick={() => openFundDrawer(goal)}
                      className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Fund
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Saved</p>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {showAmounts ? `${goal.currencySymbol}${formatMoney(goal.current)}` : "••••••"}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Target</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {showAmounts ? `${goal.currencySymbol}${formatMoney(goal.target)}` : "••••••"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>{progressPercent.toFixed(1)}% Complete</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isCompleted ? 'bg-emerald-500' : goal.fill} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Target: <strong>{goal.targetDate}</strong></span>
                  </div>
                  {isCompleted && (
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Achieved!</span>
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

      {/* ========================================= */}
      {/* DRAWER: ADD OR FUND                       */}
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
              {drawerMode === "add" ? "Create Milestone" : `Fund ${selectedGoal?.name}`}
            </h3>
            <p className="text-xs text-slate-500">
              {drawerMode === "add" ? "Set a new target to work towards." : "Allocate savings to this goal."}
            </p>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* FUND MODE UI */}
          {drawerMode === "fund" && selectedGoal && (
            <div className="animate-in fade-in space-y-6">
              <div className={`p-6 rounded-2xl ${selectedGoal.bg} ${selectedGoal.color} text-center`}>
                <selectedGoal.icon className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-bold text-lg mb-1">{selectedGoal.name}</h4>
                <p className="text-sm opacity-80">Remaining: {selectedGoal.currencySymbol}{formatMoney(selectedGoal.target - selectedGoal.current)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Amount to Allocate</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{selectedGoal.currencySymbol}</span>
                  <input type="number" placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Funding Source</label>
                <select className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium">
                  <option>Naira Checking (₦2,150,000)</option>
                  <option>Korezi Store Revenue (₦12,450,000)</option>
                </select>
              </div>
            </div>
          )}

          {/* ADD MODE UI */}
          {drawerMode === "add" && (
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
                      <p className="text-sm font-bold">{smartInsight.warning}</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)]">
                      <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">Smart Savings Plan</p>
                        <p className="text-xs opacity-90 leading-relaxed">
                          To hit this target in <strong>{smartInsight.months} months</strong>, you need to save <strong>{addForm.currency}{formatMoney(smartInsight.monthly)} every month</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-[1fr_auto] gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Milestone Name</label>
                  <input type="text" placeholder="e.g. Maldives Trip" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Currency</label>
                  <select 
                    value={addForm.currency}
                    onChange={(e) => setAddForm({...addForm, currency: e.target.value as "₦" | "£" | "$", targetAmount: "", currentAmount: ""})}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-bold"
                  >
                    <option value="₦">₦ NGN</option>
                    <option value="£">£ GBP</option>
                    <option value="$">$ USD</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{addForm.currency}</span>
                    <input type="number" value={addForm.targetAmount} onChange={(e) => setAddForm({...addForm, targetAmount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Starting Balance</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{addForm.currency}</span>
                    <input type="number" value={addForm.currentAmount} onChange={(e) => setAddForm({...addForm, currentAmount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Target Completion Date</label>
                <input type="date" value={addForm.targetDate} onChange={(e) => setAddForm({...addForm, targetDate: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Actions with items-center for correct Trash2 alignment */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3 items-center">
          {drawerMode === "fund" && (
            <button className="p-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setIsDrawerOpen(false)} className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button className="flex-1 px-4 py-3.5 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20">
            {drawerMode === "add" ? "Save Goal" : "Allocate Funds"}
          </button>
        </div>
      </div>

    </div>
  );
}
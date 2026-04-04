"use client";

import { useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  Store, 
  Sparkles, 
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Plane,
  Wifi
} from "lucide-react";

// Mock data for the 7 recent transactions
const recentTransactions = [
  { id: 1, title: "Korezi Store Payout", category: "Income", date: "Today, 10:23 AM", amount: "+₦450,000", isIncome: true, icon: Store },
  { id: 2, title: "AWS Hosting", category: "Software", date: "Yesterday, 2:15 PM", amount: "-£120.00", isIncome: false, icon: Wifi },
  { id: 3, title: "Loan Repayment - Sarah", category: "Transfer", date: "Apr 2, 2026", amount: "+₦50,000", isIncome: true, icon: ArrowUpRight },
  { id: 4, title: "Office Supplies", category: "Expense", date: "Apr 1, 2026", amount: "-₦32,500", isIncome: false, icon: Receipt },
  { id: 5, title: "Client Payment - TechCorp", category: "Income", date: "Mar 28, 2026", amount: "+$1,200.00", isIncome: true, icon: BriefcaseIcon },
  { id: 6, title: "Internet Bill", category: "Utilities", date: "Mar 27, 2026", amount: "-₦25,000", isIncome: false, icon: Wifi },
  { id: 7, title: "Flight to London", category: "Travel", date: "Mar 25, 2026", amount: "-£450.00", isIncome: false, icon: Plane },
];

// Fallback icon for the array above
function BriefcaseIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

export default function DashboardPage() {
  // State for the currency switcher
  const [currency, setCurrency] = useState<"NGN" | "GBP" | "USD">("NGN");

  // Dynamic Net Worth Data based on the switcher
  const netWorthData = {
    NGN: { main: "₦45,231,000", sub: "≈ £22,615.50 at current mid-market rate" },
    GBP: { main: "£22,615.50", sub: "≈ ₦45,231,000 at current mid-market rate" },
    USD: { main: "$28,500.00", sub: "≈ ₦45,231,000 at current mid-market rate" }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* TOP ROW: Total Net Worth Hero Card */}
      <div className="glass-panel p-8 relative overflow-hidden group">
        <div className="absolute -top-6 -right-6 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Wallet className="w-48 h-48 text-[var(--color-brand-deep)]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Net Worth</p>
            
            {/* Currency Switcher Pill */}
            <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-lg w-max shadow-inner border border-black/5 dark:border-white/5">
              {(["NGN", "GBP", "USD"] as const).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    currency === cur 
                      ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight transition-all duration-300">
              {netWorthData[currency].main}
            </h2>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg mb-1 md:mb-2 w-max shadow-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">+2.4%</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium transition-all duration-300">
            {netWorthData[currency].sub}
          </p>
        </div>
      </div>

      {/* MIDDLE ROW: Multi-Currency & Store Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 hover:-translate-y-1 transition-transform cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-deep)]/10 flex items-center justify-center text-[var(--color-brand-deep)] group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-white/10 px-2.5 py-1 rounded-full shadow-sm">
              Personal
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">Naira Checking</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₦2,150,000</h3>
          <div className="flex items-center gap-1 text-emerald-500 mt-2 text-xs font-medium">
            <ArrowUpRight className="w-3 h-3" /> ₦45,000 this week
          </div>
        </div>

        <div className="glass-panel p-6 hover:-translate-y-1 transition-transform cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-white/10 px-2.5 py-1 rounded-full shadow-sm">
              Reserve
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">GBP Vault</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">£15,400</h3>
          <div className="flex items-center gap-1 text-slate-400 mt-2 text-xs font-medium">
            No recent activity
          </div>
        </div>

        <div className="glass-panel p-6 hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group border-t-4 border-t-[var(--color-brand-deep)]">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Live Sync
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium relative z-10">Korezi Store Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white relative z-10">₦12,450,000</h3>
          <div className="flex items-center gap-1 text-emerald-500 mt-2 text-xs font-medium relative z-10">
            <ArrowUpRight className="w-3 h-3" /> +12% vs last month
          </div>
        </div>

      </div>

      {/* KORE AI Brain Briefing */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--color-brand-deep)] to-[var(--color-brand-light)]"></div>
        
        <div className="flex items-center gap-3 mb-5 pl-2">
          <div className="p-2 bg-[var(--color-brand-deep)]/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-[var(--color-brand-deep)]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily AI Briefing</h3>
        </div>
        
        <ul className="space-y-4 pl-2">
          <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="w-2 h-2 rounded-full bg-[var(--color-brand-deep)] mt-1.5 flex-shrink-0 shadow-[0_0_8px_var(--color-brand-deep)]"></div>
            <p className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Store insight:</strong> Your Korezi Store revenue is up 12% this week. Consider moving ₦500,000 to the GBP Reserve to hedge against currency fluctuations.
            </p>
          </li>
          <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_#f97316]"></div>
            <p className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Action required:</strong> You have 2 pending loan repayments due this Friday totaling ₦150,000.
            </p>
          </li>
        </ul>
      </div>

      {/* BOTTOM ROW: Recent Transactions */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <button className="text-sm font-semibold text-[var(--color-brand-deep)] hover:underline">View All</button>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 -mx-4 px-4 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.isIncome 
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                }`}>
                  <tx.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-brand-deep)] transition-colors">{tx.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tx.date} • {tx.category}</p>
                </div>
              </div>
              <div className={`text-right font-bold ${
                tx.isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
              }`}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
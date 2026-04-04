import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  Store, 
  Sparkles, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* TOP ROW: Total Net Worth Hero Card */}
      <div className="glass-panel p-8 relative overflow-hidden group">
        {/* Background decorative icon */}
        <div className="absolute -top-6 -right-6 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Wallet className="w-48 h-48 text-[var(--color-brand-deep)]" />
        </div>
        
        <div className="relative z-10">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Net Worth</p>
          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
              ₦45,231,000
            </h2>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg mb-1 md:mb-2 w-max shadow-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">+2.4%</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
            ≈ £22,615.50 at current mid-market rate
          </p>
        </div>
      </div>

      {/* MIDDLE ROW: Multi-Currency & Store Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Personal Naira Account */}
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

        {/* GBP Reserve Vault */}
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

        {/* Korezi Store Live API Widget */}
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

      {/* BOTTOM ROW: KORE AI Brain Briefing */}
      <div className="glass-panel p-6 relative overflow-hidden">
        {/* Brand color accent line */}
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

    </div>
  );
}
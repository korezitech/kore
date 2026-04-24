"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Wallet, TrendingUp, CreditCard, Store, Sparkles, 
  Receipt, Plane, Wifi, Eye, EyeOff, Loader2, ArrowRightLeft, Coffee, ShoppingBag, Briefcase, Landmark
} from "lucide-react";

import { getUserAccounts } from "@/actions/accountActions";
import { getUserTransactions } from "@/actions/transactionActions";
import { getLiveExchangeRates } from "@/actions/currencyActions";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [showAmounts, setShowAmounts] = useState(true);
  const [currency, setCurrency] = useState<"₦" | "£" | "$">("₦");
  
  // Live Data States
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [liveRates, setLiveRates] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    } else if (status === "unauthenticated") {
      setIsFetching(false);
    }
  }, [userId, status]);

  const loadDashboardData = async () => {
    setIsFetching(true);
    
    // Fetch Accounts, Transactions, AND Live Rates simultaneously!
    const [accData, txData, rateData] = await Promise.all([
      getUserAccounts(userId),
      getUserTransactions(userId),
      getLiveExchangeRates()
    ]);
    
    setAccounts(accData || []);
    setTransactions(txData || []);
    
    if (rateData.success) {
        setLiveRates(rateData.rates);
    } else {
        // Fallback rates just in case the API ever goes down
        setLiveRates({ NGN: 1200, GBP: 0.79, USD: 1 }); 
    }
    
    setIsFetching(false);
  };

  const formatBalance = (val: number) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const getCurrencySymbol = (code: string) => {
    if (code === "NGN") return "₦";
    if (code === "GBP") return "£";
    if (code === "USD") return "$";
    return code; 
  };

  // LIVE Net Worth Calculator
  const calculateNetWorth = () => {
    if (!liveRates) return { main: "...", sub: "Calculating..." };

    // 1. Convert everything to a universal base (USD) first for perfect cross-math
    let totalUSD = 0;
    accounts.forEach(acc => {
      // Intercept credit accounts and treat them as liabilities (negative balance)
      const isLiability = acc.type.toLowerCase() === 'credit';
      const balance = isLiability ? -Math.abs(parseFloat(acc.balance)) : parseFloat(acc.balance);

      if (acc.currency === 'USD') totalUSD += balance;
      if (acc.currency === 'NGN') totalUSD += (balance / liveRates.NGN);
      if (acc.currency === 'GBP') totalUSD += (balance / liveRates.GBP);
    });

    // 2. Convert base USD into the user's currently selected viewing currency
    let mainValue = 0;
    let subText = "";

    if (currency === "₦") {
      mainValue = totalUSD * liveRates.NGN;
      const gbpEquivalent = totalUSD * liveRates.GBP;
      subText = `≈ ${gbpEquivalent < 0 ? '-' : ''}£${formatBalance(Math.abs(gbpEquivalent))} at live mid-market rate`;
    } else if (currency === "£") {
      mainValue = totalUSD * liveRates.GBP;
      const ngnEquivalent = totalUSD * liveRates.NGN;
      subText = `≈ ${ngnEquivalent < 0 ? '-' : ''}₦${formatBalance(Math.abs(ngnEquivalent))} at live mid-market rate`;
    } else if (currency === "$") {
      mainValue = totalUSD;
      const ngnEquivalent = totalUSD * liveRates.NGN;
      subText = `≈ ${ngnEquivalent < 0 ? '-' : ''}₦${formatBalance(Math.abs(ngnEquivalent))} at live mid-market rate`;
    }

    // 3. Format the main display value cleanly (e.g., -£1,178.16 instead of £-1,178.16)
    const isNegative = mainValue < 0;
    const formattedMain = `${isNegative ? '-' : ''}${currency}${formatBalance(Math.abs(mainValue))}`;

    return { main: formattedMain, sub: subText };
  };

  const netWorthData = calculateNetWorth();

  const getIconForCategory = (cat: string) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('income') || c.includes('salary')) return Briefcase;
    if (c.includes('software') || c.includes('tech')) return Wifi;
    if (c.includes('transfer')) return ArrowRightLeft;
    if (c.includes('expense')) return Receipt;
    if (c.includes('dining') || c.includes('food')) return Coffee;
    if (c.includes('travel') || c.includes('flight')) return Plane;
    if (c.includes('shopping') || c.includes('retail')) return ShoppingBag;
    return Store;
  };

  const getAccountStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fiat': return { Icon: Wallet, colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
      case 'business': return { Icon: Store, colorClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400", borderClass: "border-t-4 border-t-orange-500" };
      case 'credit': return { Icon: CreditCard, colorClass: "bg-rose-500/10 text-rose-500 dark:text-rose-400" };
      case 'investment': return { Icon: TrendingUp, colorClass: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" };
      default: return { Icon: Landmark, colorClass: "bg-slate-500/10 text-slate-500" };
    }
  };

  let displayAccounts = accounts.filter(acc => acc.isPinned);
  if (displayAccounts.length === 0) {
    displayAccounts = accounts.slice(0, 3); 
  }

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-brand-deep)]" />
        <p className="text-sm font-semibold">Syncing live market rates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-10">
      
      {/* TOP ROW: Total Net Worth Hero Card */}
      <div className="glass-panel p-8 relative overflow-hidden group">
        <div className="absolute -top-6 -right-6 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none z-0">
          <Wallet className="w-48 h-48 text-[var(--color-brand-deep)]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Net Worth</p>
              <button 
                onClick={() => setShowAmounts(!showAmounts)} 
                className="text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors p-1"
                title={showAmounts ? "Hide amounts" : "Show amounts"}
              >
                {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-lg w-max shadow-inner border border-black/5 dark:border-white/5">
              {(["₦", "£", "$"] as const).map((sym) => (
                <button
                  key={sym}
                  onClick={() => setCurrency(sym)}
                  className={`px-4 py-1 text-sm font-bold rounded-md transition-all ${
                    currency === sym 
                      ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight transition-all duration-300">
              {showAmounts ? netWorthData.main : "••••••"}
            </h2>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg mb-1 md:mb-2 w-max shadow-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">+2.4%</span>
            </div>
          </div>
          
          {/* LIVE MARKET RATES INDICATOR */}
            {liveRates && (
              <div className="flex items-center gap-4 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-4 bg-emerald-50 dark:bg-emerald-500/10 w-max px-2.5 py-1 rounded-md">
                 <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3"/> $1 = ₦{formatBalance(liveRates.NGN)}</span>
                 <span className="flex items-center gap-1">£1 = ₦{formatBalance(liveRates.NGN / liveRates.GBP)}</span>
              </div>
            )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium transition-all duration-300">
             {showAmounts ? netWorthData.sub : "Values hidden"}
          </p>
        </div>
      </div>

      {/* MIDDLE ROW: Dynamic Carousel for Pinned Accounts */}
      <div className="flex overflow-x-auto gap-4 md:gap-6 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayAccounts.map((acc) => {
          const { Icon, colorClass, borderClass } = getAccountStyle(acc.type);

          return (
            <div key={acc.id} className={`glass-panel p-6 flex-shrink-0 w-[85%] md:w-[320px] lg:w-[calc(33.333%-1rem)] snap-start hover:-translate-y-1 transition-transform cursor-pointer group ${borderClass || ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {!!acc.syncUrl ? (
                   <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
                     acc.type === 'business' 
                       ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10' 
                       : 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10'
                   }`}>
                     <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                       acc.type === 'business' ? 'bg-orange-500' : 'bg-emerald-500'
                     }`}></div> Live Sync
                   </span>
                ) : (
                   <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-white/10 px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
                     {acc.type}
                   </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium truncate">{acc.name}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {showAmounts ? `${getCurrencySymbol(acc.currency)}${formatBalance(acc.balance)}` : "••••••"}
              </h3>
            </div>
          );
        })}
        
        {accounts.length === 0 && (
            <div className="w-full p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-500">
                You haven't added any accounts yet.
            </div>
        )}
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
              <strong className="text-slate-900 dark:text-white">Market insight:</strong> Current USD/NGN rate is {liveRates ? `₦${formatBalance(liveRates.NGN)}` : 'updating...'}. Consider holding USD assets as the Naira fluctuates.
            </p>
          </li>
          <li className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_#f97316]"></div>
            <p className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Action required:</strong> You have 2 pending loan repayments due this Friday.
            </p>
          </li>
        </ul>
      </div>

      {/* BOTTOM ROW: Recent Transactions */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <Link href="/transactions" className="text-sm font-semibold text-[var(--color-brand-deep)] hover:underline">
            View All
          </Link>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {transactions.slice(0, 5).map((tx) => {
            const TxIcon = getIconForCategory(tx.category);
            const isCredit = tx.type === 'income';
            const symbol = getCurrencySymbol(tx.currency);

            return (
                <div key={tx.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 -mx-4 px-4 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCredit 
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                    }`}>
                      <TxIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-brand-deep)] transition-colors">{tx.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tx.date.split(' ')[0]} • {tx.accountName}</p>
                    </div>
                  </div>
                  <div className={`text-right font-bold ${
                    isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                  }`}>
                    {showAmounts ? `${isCredit ? '+' : '-'}${symbol}${formatBalance(tx.amount)}` : "••••••"}
                  </div>
                </div>
            );
          })}

          {transactions.length === 0 && (
             <div className="py-8 text-center text-slate-500 text-sm">
                 No recent transactions found.
             </div>
          )}
        </div>
      </div>

    </div>
  );
}
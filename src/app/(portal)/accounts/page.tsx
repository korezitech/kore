"use client";

import { useState } from "react";
import { Landmark, Plus, X, Wallet, CreditCard, Building, TrendingUp, MoreHorizontal, Trash2, Eye, EyeOff } from "lucide-react";

// Updated dummy data with currency codes for easier editing
const dummyAccounts = [
  { id: 1, name: "Naira Checking", type: "fiat", currencyCode: "NGN", symbol: "₦", balance: "2150000", accountTail: "4092" },
  { id: 2, name: "GBP Vault", type: "fiat", currencyCode: "GBP", symbol: "£", balance: "15400", accountTail: "8810" },
  { id: 3, name: "USD Savings", type: "fiat", currencyCode: "USD", symbol: "$", balance: "4200", accountTail: "1102" },
  { id: 4, name: "Korezi Store", type: "business", currencyCode: "NGN", symbol: "₦", balance: "12450000", accountTail: "Biz" },
  { id: 5, name: "AMEX Platinum", type: "credit", currencyCode: "USD", symbol: "$", balance: "-450", accountTail: "1005" },
  { id: 6, name: "NGX Portfolio", type: "investment", currencyCode: "NGN", symbol: "₦", balance: "8340000", accountTail: "Stock" },
];

export default function AccountsPage() {
  // Privacy mode state
  const [showAmounts, setShowAmounts] = useState(true);

  // Drawer visibility and mode state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);
  
  // Form input states
  const [accountType, setAccountType] = useState("fiat");
  const [currency, setCurrency] = useState("NGN");
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");

  // Helper to format numbers with commas for display on the cards
  const formatBalance = (val: string) => Number(val).toLocaleString();

  // Handlers for opening the drawer
  const openAddDrawer = () => {
    setDrawerMode("add");
    setActiveAccountId(null);
    setAccountType("fiat");
    setCurrency("NGN");
    setAccountName("");
    setBalance("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (acc: typeof dummyAccounts[0]) => {
    setDrawerMode("edit");
    setActiveAccountId(acc.id);
    setAccountType(acc.type);
    setCurrency(acc.currencyCode);
    setAccountName(acc.name);
    setBalance(acc.balance);
    setIsDrawerOpen(true);
  };

  const getAccountsByType = (type: string) => dummyAccounts.filter(acc => acc.type === type);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Accounts</h2>
            <button 
              onClick={() => setShowAmounts(!showAmounts)} 
              className="text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors p-1 mt-1"
              title={showAmounts ? "Hide amounts" : "Show amounts"}
            >
              {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your fiat, business, and credit portfolios.</p>
        </div>
        <button 
          onClick={openAddDrawer}
          className="flex items-center gap-1.5 md:gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Add Account
        </button>
      </div>

      {/* ACCOUNTS DASHBOARD UI */}
      <div className="space-y-10">
        
        {/* FIAT & CASH SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fiat & Cash</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAccountsByType("fiat").map(acc => (
              <div key={acc.id} className="glass-panel p-5 group hover:border-[var(--color-brand-deep)]/50 transition-colors relative">
                <button 
                  onClick={() => openEditDrawer(acc)}
                  className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 dark:hover:bg-[var(--color-brand-light)]/20 transition-all cursor-pointer z-10"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 font-bold text-lg">
                  {acc.symbol}
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 pr-8">{acc.name}</p>
                <p className="text-xs text-slate-400 mb-3">•••• {acc.accountTail}</p>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {showAmounts ? `${acc.symbol}${formatBalance(acc.balance)}` : "••••••"}
                </h4>
              </div>
            ))}
          </div>
        </section>

        {/* BUSINESS & ENTERPRISE SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Business Vaults</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAccountsByType("business").map(acc => (
              <div key={acc.id} className="glass-panel p-5 group hover:border-[var(--color-brand-deep)]/50 transition-colors relative">
                <button 
                  onClick={() => openEditDrawer(acc)}
                  className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 dark:hover:bg-[var(--color-brand-light)]/20 transition-all cursor-pointer z-10"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
                  <Building className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 pr-8">{acc.name}</p>
                <p className="text-xs text-slate-400 mb-3">{acc.accountTail}</p>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {showAmounts ? `${acc.symbol}${formatBalance(acc.balance)}` : "••••••"}
                </h4>
              </div>
            ))}
          </div>
        </section>

        {/* CREDIT & INVESTMENTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Credit Lines</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {getAccountsByType("credit").map(acc => (
                <div key={acc.id} className="glass-panel p-5 group hover:border-[var(--color-brand-deep)]/50 transition-colors flex justify-between items-center relative">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{acc.name}</p>
                      <p className="text-xs text-slate-400">•••• {acc.accountTail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                      {showAmounts ? `${acc.symbol}${formatBalance(acc.balance)}` : "••••••"}
                    </h4>
                    <button 
                      onClick={() => openEditDrawer(acc)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 dark:hover:bg-[var(--color-brand-light)]/20 transition-all cursor-pointer"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Investments</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {getAccountsByType("investment").map(acc => (
                <div key={acc.id} className="glass-panel p-5 group hover:border-[var(--color-brand-deep)]/50 transition-colors flex justify-between items-center relative">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{acc.name}</p>
                      <p className="text-xs text-slate-400">{acc.accountTail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {showAmounts ? `${acc.symbol}${formatBalance(acc.balance)}` : "••••••"}
                    </h4>
                    <button 
                      onClick={() => openEditDrawer(acc)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 dark:hover:bg-[var(--color-brand-light)]/20 transition-all cursor-pointer"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

      {/* ========================================= */}
      {/* SLIDE-OUT DRAWER OVERLAY & PANEL */}
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
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {drawerMode === "add" ? "Add New Account" : "Edit Account"}
          </h3>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 dark:text-white">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "fiat", label: "Fiat / Cash", icon: Wallet },
                { id: "business", label: "Business", icon: Building },
                { id: "credit", label: "Credit Card", icon: CreditCard },
                { id: "investment", label: "Investment", icon: TrendingUp },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setAccountType(type.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    accountType === type.id 
                      ? "border-[var(--color-brand-deep)] bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)]" 
                      : "border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  <type.icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account Name</label>
              <input 
                type="text" 
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Zenith Checking, AMEX" 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Currency</label>
                <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                  {["NGN", "GBP", "USD"].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setCurrency(cur)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
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
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Balance</label>
                <input 
                  type="number" 
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer / Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3 items-center">
          {/* Delete button only shows in Edit mode */}
          {drawerMode === "edit" && (
            <button className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20"
          >
            {drawerMode === "add" ? "Save Account" : "Update"}
          </button>
        </div>

      </div>
    </div>
  );
}
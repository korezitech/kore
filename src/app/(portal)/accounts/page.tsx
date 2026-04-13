"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Landmark, Plus, X, Wallet, CreditCard, Building, TrendingUp, 
  MoreHorizontal, Trash2, Eye, EyeOff, Loader2, AlertTriangle, Pin, PinOff, Edit3 
} from "lucide-react";
import { getUserAccounts, createAccount, updateAccount, deleteAccount, togglePinAccount } from "@/actions/accountActions";

// Custom type for our Confirm Modal
type ConfirmConfig = {
  title: string;
  message: string;
  actionText: string;
  actionColor: string;
  iconColor: string;
  onConfirm: () => Promise<void>;
};

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  // Real Database State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Privacy & UI States
  const [showAmounts, setShowAmounts] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Custom Confirm Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Drawer visibility and mode state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  
  // Form input states
  const [accountType, setAccountType] = useState("fiat");
  const [currency, setCurrency] = useState("NGN");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (userId) {
      loadAccounts();
    } else if (status === "unauthenticated") {
      setIsFetching(false);
    }
  }, [userId, status]);

  const loadAccounts = async () => {
    setIsFetching(true);
    const data = await getUserAccounts(userId);
    setAccounts(data || []);
    setIsFetching(false);
  };

  // Helpers
  const formatBalance = (val: string | number) => Number(val).toLocaleString();
  const getCurrencySymbol = (code: string) => {
    if (code === "NGN") return "₦";
    if (code === "GBP") return "£";
    if (code === "USD") return "$";
    return code; 
  };

  const openAddDrawer = () => {
    setDrawerMode("add");
    setActiveAccountId(null);
    setAccountType("fiat");
    setCurrency("NGN");
    setAccountName("");
    setAccountNumber("");
    setBalance("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (acc: any) => {
    setDrawerMode("edit");
    setActiveAccountId(acc.id);
    setAccountType(acc.type);
    setCurrency(acc.currency); 
    setAccountName(acc.name);
    setAccountNumber(acc.accountNumber || "");
    setBalance(acc.balance);
    setIsDrawerOpen(true);
  };

  const handleSaveAccount = async () => {
    if (!accountName || !balance || !accountNumber) return alert("Please fill in all fields (Name, Number, and Balance)");
    
    setIsSubmitting(true);
    
    if (drawerMode === "add") {
      const result = await createAccount({
        userId, name: accountName, type: accountType, currency, balance, accountNumber 
      });
      if (result.success) {
        await loadAccounts(); 
        setIsDrawerOpen(false);
      } else alert(result.error);
    } else {
      const result = await updateAccount({
        accountId: activeAccountId, userId, name: accountName, type: accountType, currency, balance, accountNumber
      });
      if (result.success) {
        await loadAccounts(); 
        setIsDrawerOpen(false);
      } else alert(result.error);
    }
    
    setIsSubmitting(false);
  };

  // NEW: Pin/Unpin Handler
  const handleTogglePin = async (accountId: string, currentPinStatus: number) => {
    const isPinned = currentPinStatus ? false : true;
    
    // Optimistic UI update (makes it feel instantly fast!)
    setAccounts(accounts.map(acc => acc.id === accountId ? { ...acc, isPinned: isPinned ? 1 : 0 } : acc));
    
    // Tell the database
    const result = await togglePinAccount(accountId, userId, isPinned);
    if (!result.success) {
      await loadAccounts(); // Revert if it fails
      alert(result.error);
    }
  };

  // Custom Confirm Handler for Deleting Accounts
  const handleDeleteAccount = () => {
    if (!activeAccountId) return;
    setConfirmConfig({
      title: "Delete Account",
      message: `Are you sure you want to permanently delete this account? This will remove all associated financial records and cannot be undone.`,
      actionText: "Delete Account",
      actionColor: "bg-rose-600 hover:bg-rose-700",
      iconColor: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      onConfirm: async () => {
        const result = await deleteAccount(activeAccountId, userId);
        if (result.success) {
          await loadAccounts(); 
          setIsDrawerOpen(false);
        } else alert("Error deleting account: " + result.error);
        setIsConfirmModalOpen(false);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const getAccountsByType = (type: string) => accounts.filter(acc => acc.type === type);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-24">
      
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

      {/* LOADING STATE */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-brand-deep)]" />
          <p className="text-sm font-semibold">Decrypting vault data...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center py-20 text-slate-500 text-center">
          <Landmark className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Accounts Found</h3>
          <p className="text-sm max-w-sm mb-6">You haven't connected or created any financial accounts yet. Add your first account to get started.</p>
          <button onClick={openAddDrawer} className="text-[var(--color-brand-deep)] font-bold hover:underline">
            + Create your first account
          </button>
        </div>
      ) : (
        /* ACCOUNTS DASHBOARD UI */
        <div className="space-y-10">
          
          {/* FIAT & CASH SECTION */}
          {getAccountsByType("fiat").length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fiat & Cash</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getAccountsByType("fiat").map(acc => (
                  <div key={acc.id} className="glass-panel p-5 group hover:border-[var(--color-brand-deep)]/50 transition-colors relative">
                    
                    {/* DROPDOWN MENU */}
                    <div className="absolute top-4 right-4 z-20">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === acc.id ? null : acc.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 transition-all cursor-pointer"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {openMenuId === acc.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 py-1">
                            <button onClick={() => { openEditDrawer(acc); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              <Edit3 className="w-4 h-4 text-slate-400" /> Edit Details
                            </button>
                            <button onClick={() => { handleTogglePin(acc.id, acc.isPinned); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              {acc.isPinned ? <PinOff className="w-4 h-4 text-slate-400" /> : <Pin className="w-4 h-4 text-[var(--color-brand-deep)]" />} 
                              {acc.isPinned ? "Unpin Account" : "Pin to Dashboard"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 font-bold text-lg">
                      {getCurrencySymbol(acc.currency)}
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 pr-8 flex items-center gap-1.5">
                      {acc.name}
                      {!!acc.isPinned && <Pin className="w-3 h-3 text-[var(--color-brand-deep)]" fill="currentColor" />}
                    </p>
                    <p className="text-xs text-slate-400 mb-3">•••• {acc.accountNumber?.slice(-4) || '****'}</p>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {showAmounts ? `${getCurrencySymbol(acc.currency)}${formatBalance(acc.balance)}` : "••••••"}
                    </h4>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* BUSINESS & ENTERPRISE SECTION */}
          {getAccountsByType("business").length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Business Vaults</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getAccountsByType("business").map(acc => (
                  <div key={acc.id} className="glass-panel p-5 group hover:border-[var(--color-brand-deep)]/50 transition-colors relative">
                    
                    {/* DROPDOWN MENU */}
                    <div className="absolute top-4 right-4 z-20">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === acc.id ? null : acc.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 transition-all cursor-pointer"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {openMenuId === acc.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 py-1">
                            <button onClick={() => { openEditDrawer(acc); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              <Edit3 className="w-4 h-4 text-slate-400" /> Edit Details
                            </button>
                            <button onClick={() => { handleTogglePin(acc.id, acc.isPinned); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              {acc.isPinned ? <PinOff className="w-4 h-4 text-slate-400" /> : <Pin className="w-4 h-4 text-[var(--color-brand-deep)]" />} 
                              {acc.isPinned ? "Unpin Account" : "Pin to Dashboard"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
                      <Building className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 pr-8 flex items-center gap-1.5">
                      {acc.name}
                      {!!acc.isPinned && <Pin className="w-3 h-3 text-[var(--color-brand-deep)]" fill="currentColor" />}
                    </p>
                    <p className="text-xs text-slate-400 mb-3">{acc.accountNumber}</p>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {showAmounts ? `${getCurrencySymbol(acc.currency)}${formatBalance(acc.balance)}` : "••••••"}
                    </h4>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CREDIT & INVESTMENTS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {getAccountsByType("credit").length > 0 && (
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
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            {acc.name}
                            {!!acc.isPinned && <Pin className="w-3 h-3 text-[var(--color-brand-deep)]" fill="currentColor" />}
                          </p>
                          <p className="text-xs text-slate-400">•••• {acc.accountNumber?.slice(-4) || '****'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                          {showAmounts ? `${getCurrencySymbol(acc.currency)}${formatBalance(acc.balance)}` : "••••••"}
                        </h4>
                        
                        {/* DROPDOWN MENU FOR COMPACT ROWS */}
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === acc.id ? null : acc.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 transition-all cursor-pointer relative z-20"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          
                          {openMenuId === acc.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                              <div className="absolute top-10 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 py-1">
                                <button onClick={() => { openEditDrawer(acc); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                  <Edit3 className="w-4 h-4 text-slate-400" /> Edit Details
                                </button>
                                <button onClick={() => { handleTogglePin(acc.id, acc.isPinned); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                  {acc.isPinned ? <PinOff className="w-4 h-4 text-slate-400" /> : <Pin className="w-4 h-4 text-[var(--color-brand-deep)]" />} 
                                  {acc.isPinned ? "Unpin Account" : "Pin to Dashboard"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {getAccountsByType("investment").length > 0 && (
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
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            {acc.name}
                            {!!acc.isPinned && <Pin className="w-3 h-3 text-[var(--color-brand-deep)]" fill="currentColor" />}
                          </p>
                          <p className="text-xs text-slate-400">{acc.accountNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {showAmounts ? `${getCurrencySymbol(acc.currency)}${formatBalance(acc.balance)}` : "••••••"}
                        </h4>
                        
                        {/* DROPDOWN MENU FOR COMPACT ROWS */}
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === acc.id ? null : acc.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 transition-all cursor-pointer relative z-20"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          
                          {openMenuId === acc.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                              <div className="absolute top-10 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 py-1">
                                <button onClick={() => { openEditDrawer(acc); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                  <Edit3 className="w-4 h-4 text-slate-400" /> Edit Details
                                </button>
                                <button onClick={() => { handleTogglePin(acc.id, acc.isPinned); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                  {acc.isPinned ? <PinOff className="w-4 h-4 text-slate-400" /> : <Pin className="w-4 h-4 text-[var(--color-brand-deep)]" />} 
                                  {acc.isPinned ? "Unpin Account" : "Pin to Dashboard"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SLIDE-OUT DRAWER OVERLAY & PANEL */}
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {drawerMode === "add" ? "Add New Account" : "Edit Account"}
          </h3>
          <button 
            onClick={() => !isSubmitting && setIsDrawerOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                  disabled={isSubmitting}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all disabled:opacity-50 ${
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
                disabled={isSubmitting}
                placeholder="e.g. Zenith Checking, AMEX" 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account Number / ID</label>
              <input 
                type="text" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. 1234567890" 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all disabled:opacity-50"
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
                      disabled={isSubmitting}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-50 ${
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
                  disabled={isSubmitting}
                  placeholder="0.00" 
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all font-medium disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3 items-center">
          {drawerMode === "edit" && (
            <button 
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
              className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>
          )}
          
          <button 
            onClick={() => setIsDrawerOpen(false)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveAccount}
            disabled={isSubmitting}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {drawerMode === "add" ? "Save Account" : "Update"}
          </button>
        </div>

      </div>

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {isConfirmModalOpen && confirmConfig && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => !isConfirming && setIsConfirmModalOpen(false)} 
          />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full mb-4 flex items-center justify-center ${confirmConfig.iconColor}`}>
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {confirmConfig.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                {confirmConfig.message}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={isConfirming}
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsConfirming(true);
                    await confirmConfig.onConfirm();
                    setIsConfirming(false);
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

    </div>
  );
}
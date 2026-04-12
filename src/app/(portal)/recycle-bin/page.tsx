"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Trash2, RotateCcw, AlertOctagon, Clock, 
  Landmark, ArrowRightLeft, ShieldAlert, X, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { getRecycledItems, restoreItem, permanentDeleteItem, emptyRecycleBin } from "@/actions/recycleBinActions";

export default function RecycleBinPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<"All" | "Transaction" | "Account">("All");
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Custom confirm state for Empty Bin
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  useEffect(() => {
    if (userId) {
      loadData();
    } else if (status === "unauthenticated") {
      setIsFetching(false);
    }
  }, [userId, status]);

  const loadData = async () => {
    setIsFetching(true);
    const items = await getRecycledItems(userId);
    setDeletedItems(items || []);
    setIsFetching(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredItems = deletedItems.filter(item => filter === "All" || item.type === filter);

  const getCurrencySymbol = (code: string) => {
    if (code === "NGN") return "₦";
    if (code === "GBP") return "£";
    if (code === "USD") return "$";
    return code || ""; 
  };

  const formatMoney = (amount: number) => Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const handleRestore = async (id: string, type: string) => {
    setIsSubmitting(true);
    const result = await restoreItem(id, type, userId);
    
    if (result.success) {
      showToast(`${type} restored successfully.`, "success");
      await loadData();
    } else {
      showToast("Failed to restore: " + result.error, "error");
    }
    setIsSubmitting(false);
  };

  const handlePermanentDelete = async (id: string, type: string) => {
    setIsSubmitting(true);
    const result = await permanentDeleteItem(id, type, userId);
    
    if (result.success) {
      showToast(`${type} permanently deleted.`, "success");
      await loadData();
    } else {
      showToast("Failed to delete: " + result.error, "error");
    }
    setIsSubmitting(false);
  };

  const handleEmptyBin = async () => {
    setIsSubmitting(true);
    const result = await emptyRecycleBin(userId);
    
    if (result.success) {
      showToast("Recycle bin emptied.", "success");
      setConfirmEmpty(false);
      setDeletedItems([]);
    } else {
      showToast("Failed to empty bin: " + result.error, "error");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto min-h-[80vh] relative">
      
      {/* CUSTOM TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/10 font-bold text-sm animate-in slide-in-from-bottom-5 flex items-center gap-3 ${
          toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Recycle Bin</h2>
            {!isFetching && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 px-2.5 py-1 rounded-full shadow-sm border border-rose-200 dark:border-rose-500/20">
                {deletedItems.length} Items
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Recover deleted records or permanently erase them.</p>
        </div>
        
        {/* INLINE CONFIRM EMPTY BIN */}
        <div className="w-full md:w-auto flex justify-end">
          {!confirmEmpty ? (
            <button 
              onClick={() => setConfirmEmpty(true)}
              disabled={deletedItems.length === 0 || isSubmitting || isFetching}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" /> Empty Bin
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full md:w-auto animate-in slide-in-from-right-4">
              <button 
                onClick={handleEmptyBin}
                disabled={isSubmitting}
                className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Empty"}
              </button>
              <button 
                onClick={() => setConfirmEmpty(false)}
                disabled={isSubmitting}
                className="flex-1 md:flex-none bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-slate-200 dark:hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 30-DAY WARNING BANNER */}
      <div className="flex items-start gap-4 p-4 md:p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Data Retention Policy</h4>
          <p className="text-xs md:text-sm text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">
            Items in the recycle bin are securely held for <strong>30 days</strong> before being permanently erased from KORE servers. Restoring an account will also restore all its associated transactions.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="glass-panel overflow-hidden flex flex-col">
        
        {/* Filters */}
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 p-2 gap-2">
          {(["All", "Transaction", "Account"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                filter === tab 
                  ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] shadow-sm border border-slate-200 dark:border-white/5" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Items List */}
        {isFetching ? (
           <div className="flex flex-col items-center justify-center py-20 text-slate-500">
             <Loader2 className="w-8 h-8 animate-spin mb-4 text-rose-500" />
             <p className="text-sm font-semibold">Scanning recycle bin...</p>
           </div>
        ) : filteredItems.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredItems.map((item) => {
              const isAccount = item.type === 'Account';
              const Icon = isAccount ? Landmark : ArrowRightLeft;
              const colorClass = isAccount ? "text-blue-500 bg-blue-50 dark:bg-blue-500/10" : "text-slate-500 bg-slate-100 dark:bg-white/10";
              const symbol = getCurrencySymbol(item.currency);
              const sign = item.txType === 'income' ? '+' : (item.txType === 'expense' ? '-' : '');

              return (
                <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 transition-colors group ${isSubmitting ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50/50 dark:hover:bg-white/5'}`}>
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                          {item.type}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Deleted {item.deletedAt}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <p className={`text-sm font-medium ${item.txType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {sign}{symbol}{formatMoney(item.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${item.daysLeft <= 7 ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-amber-600 bg-amber-50 dark:bg-amber-500/10'}`}>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {item.daysLeft} days left
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handlePermanentDelete(item.id, item.type)}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-colors disabled:opacity-50"
                        title="Delete Permanently"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleRestore(item.id, item.type)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" /> Restore
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Recycle Bin is Empty</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">No deleted items match your current filter. You're all caught up!</p>
          </div>
        )}

      </div>
    </div>
  );
}
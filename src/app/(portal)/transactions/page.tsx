"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Search, Filter, Download, 
  Store, Wifi, Plane, Receipt, Briefcase, Coffee, ShoppingBag, X, 
  Plus, UploadCloud, Camera, FileText, Loader2, ArrowRightLeft, Trash2, Save, AlertCircle, CheckCircle2, ChevronDown
} from "lucide-react";
import { getUserTransactions, createTransaction, deleteTransaction, updateTransactionNotes, bulkDeleteTransactions } from "@/actions/transactionActions";
import { getUserAccounts } from "@/actions/accountActions";

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [myAccounts, setMyAccounts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [txFilter, setTxFilter] = useState<"All" | "Income" | "Expense">("All");
  
  // Bulk Select State
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  // Drawer States
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [txNotes, setTxNotes] = useState(""); 
  
  // Delete Configuration
  const [confirmDelete, setConfirmDelete] = useState(false); 
  const [reverseBalance, setReverseBalance] = useState(true); // Reversing balance is checked by default
  
  // Add States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "scan">("scan"); 
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Expense");
  const [txType, setTxType] = useState<"expense" | "income">("expense");

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (userId) {
      loadData();
    } else if (status === "unauthenticated") {
      setIsFetching(false);
    }
  }, [userId, status]);

  const loadData = async () => {
    setIsFetching(true);
    const [txData, accountsData] = await Promise.all([
      getUserTransactions(userId),
      getUserAccounts(userId)
    ]);
    
    setTransactions(txData || []);
    setMyAccounts(accountsData || []);
    
    if (accountsData && accountsData.length > 0) {
      setSelectedAccountId(accountsData[0].id);
    }
    
    setIsFetching(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); 
  };

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

  const formatMoney = (amount: number) => Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const getCurrencySymbol = (code: string) => {
    if (code === "NGN") return "₦";
    if (code === "GBP") return "£";
    if (code === "USD") return "$";
    return code || ""; 
  };

  // Filter Logic (Search + Dropdown Filter)
  const filteredTransactions = transactions.filter(tx => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = (tx.title && tx.title.toLowerCase().includes(searchStr)) ||
        (tx.accountName && tx.accountName.toLowerCase().includes(searchStr)) ||
        (tx.category && tx.category.toLowerCase().includes(searchStr));
        
      const matchesFilter = txFilter === "All" || 
                           (txFilter === "Income" && tx.type === 'income') || 
                           (txFilter === "Expense" && tx.type !== 'income');
                           
      return matchesSearch && matchesFilter;
  });

  // Bulk Selection Handlers
  const toggleSelectAll = (checked: boolean) => {
      if (checked) {
          setSelectedTxIds(filteredTransactions.map(tx => tx.id));
      } else {
          setSelectedTxIds([]);
      }
  };

  const toggleSelectTx = (id: string, checked: boolean) => {
      if (checked) {
          setSelectedTxIds(prev => [...prev, id]);
      } else {
          setSelectedTxIds(prev => prev.filter(txId => txId !== id));
      }
  };

  // Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return showToast("No transactions to export.", "error");

    const headers = ["Transaction ID", "Date", "Merchant", "Category", "Account", "Type", "Amount", "Currency", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(tx => [
        tx.id, tx.date, `"${tx.title}"`, tx.category, `"${tx.accountName}"`, tx.type, tx.amount, tx.currency, tx.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `kore_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    showToast("Export successful!", "success");
  };

  // Add Transaction
  const handleSaveTransaction = async () => {
    if (!amount || !merchant || !selectedAccountId || !date) {
      return showToast("Please fill out all required fields.", "error");
    }

    setIsSubmitting(true);
    const result = await createTransaction({
      userId, accountId: selectedAccountId, title: merchant, category, amount: parseFloat(amount), type: txType, date, status: 'completed'
    });

    if (result.success) {
      await loadData(); 
      setAmount(""); setMerchant(""); setDate(""); setIsAddOpen(false);
      showToast("Transaction saved successfully.", "success");
    } else {
      showToast("Error: " + result.error, "error");
    }
    setIsSubmitting(false);
  };

  // Delete Individual Transaction
  const handleDeleteTransaction = async () => {
      if (!selectedTx) return;
      setIsSubmitting(true);
      
      const result = await deleteTransaction(selectedTx.id, userId, reverseBalance);
      
      if (result.success) {
          setSelectedTx(null);
          setConfirmDelete(false);
          await loadData();
          showToast(reverseBalance ? "Transaction deleted and balance reversed." : "Transaction deleted. Balance unchanged.", "success");
      } else {
          showToast("Failed to delete: " + result.error, "error");
      }
      setIsSubmitting(false);
  };

  // Delete Bulk Transactions
  const handleBulkDelete = async () => {
      if (selectedTxIds.length === 0) return;
      setIsSubmitting(true);
      
      const result = await bulkDeleteTransactions(selectedTxIds, userId, reverseBalance);
      
      if (result.success) {
          setSelectedTxIds([]);
          setShowBulkDeleteConfirm(false);
          await loadData();
          showToast(reverseBalance ? `${selectedTxIds.length} transactions deleted and balances reversed.` : `${selectedTxIds.length} transactions deleted. Balances unchanged.`, "success");
      } else {
          showToast("Failed to delete: " + result.error, "error");
      }
      setIsSubmitting(false);
  }

  // Notes
  const handleSaveNotes = async () => {
      if (!selectedTx) return;
      setIsSubmitting(true);
      const result = await updateTransactionNotes(selectedTx.id, userId, txNotes);
      
      if (result.success) {
          showToast("Notes saved successfully.", "success");
          const updatedTransactions = transactions.map(t => t.id === selectedTx.id ? { ...t, notes: txNotes } : t);
          setTransactions(updatedTransactions);
      } else {
          showToast("Failed to save notes: " + result.error, "error");
      }
      setIsSubmitting(false);
  };

  const closeDrawer = () => {
    setSelectedTx(null);
    setConfirmDelete(false); 
    setReverseBalance(true); // Reset flag when closing
  }

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => setIsLoadingMore(false), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh] pb-24">
      
      {/* CUSTOM TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/10 font-bold text-sm animate-in slide-in-from-top-5 flex items-center gap-3 ${
          toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* FLOATING BULK ACTION BAR */}
      {selectedTxIds.length > 0 && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto max-w-sm z-[90] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 md:px-6 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
               <span className="text-sm font-bold bg-white/20 dark:bg-black/10 px-2.5 py-1 rounded-lg">{selectedTxIds.length}</span>
               <span className="text-sm font-semibold hidden md:inline">Selected</span>
            </div>
            <div className="w-px h-6 bg-white/20 dark:bg-black/10 hidden md:block mx-1"></div>
            <button 
               onClick={() => { setReverseBalance(true); setShowBulkDeleteConfirm(true); }} 
               className="text-sm font-bold text-rose-400 dark:text-rose-500 hover:text-rose-300 transition-colors flex items-center gap-2"
            >
               <Trash2 className="w-4 h-4" /> Delete Selected
            </button>
            <button onClick={() => setSelectedTxIds([])} className="p-1 rounded-full hover:bg-white/10 dark:hover:bg-black/10 transition-colors ml-2">
               <X className="w-4 h-4 text-slate-400" />
            </button>
         </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {showBulkDeleteConfirm && (
         <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl p-6 w-full max-w-sm transform transition-all scale-in-95">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4">
                 <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete {selectedTxIds.length} Transactions?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">These records will be moved to the recycle bin.</p>
              
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 mb-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                 <input 
                    type="checkbox" 
                    checked={reverseBalance} 
                    onChange={(e) => setReverseBalance(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-[var(--color-brand-deep)] focus:ring-[var(--color-brand-deep)]/50 cursor-pointer"
                 />
                 <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reverse account balances</span>
              </label>

              <div className="flex gap-3">
                 <button onClick={() => setShowBulkDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
                 <button onClick={handleBulkDelete} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                 </button>
              </div>
           </div>
         </div>
      )}

      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Transactions</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Your unified financial ledger across all accounts.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <Download className="w-4 h-4" /> <span className="hidden md:inline">Export</span>
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* COMMAND BAR */}
      <div className="glass-panel p-2 md:p-3 flex flex-col md:flex-row gap-3 relative z-50 !overflow-visible">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by merchant, account, or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all"
          />
        </div>
        <div className="flex gap-2 relative">
          <button 
             onClick={() => setFilterOpen(!filterOpen)} 
             className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
               txFilter !== "All" 
                 ? "bg-[var(--color-brand-deep)]/10 border-[var(--color-brand-deep)]/20 text-[var(--color-brand-deep)] dark:bg-[var(--color-brand-deep)]/20 dark:text-white" 
                 : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
             }`}
          >
            <Filter className="w-4 h-4" /> {txFilter === "All" ? "Filter" : txFilter} <ChevronDown className="w-3 h-3 opacity-50" />
          </button>

          {/* FILTER DROPDOWN */}
          {filterOpen && (
             <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-[80] overflow-hidden animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { setTxFilter("All"); setFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${txFilter === "All" ? "text-[var(--color-brand-deep)]" : "text-slate-700 dark:text-slate-300"}`}>All Transactions</button>
                <button onClick={() => { setTxFilter("Income"); setFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/5 ${txFilter === "Income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>Money In (Income)</button>
                <button onClick={() => { setTxFilter("Expense"); setFilterOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/5 ${txFilter === "Expense" ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>Money Out (Expense)</button>
             </div>
          )}
        </div>
      </div>

      {/* THE LEDGER */}
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-brand-deep)]" />
          <p className="text-sm font-semibold">Syncing unified ledger...</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
            <div className="col-span-4 flex items-center gap-3">
              <input 
                 type="checkbox" 
                 checked={filteredTransactions.length > 0 && selectedTxIds.length === filteredTransactions.length}
                 onChange={(e) => toggleSelectAll(e.target.checked)}
                 className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-[var(--color-brand-deep)] focus:ring-[var(--color-brand-deep)]/50 bg-transparent cursor-pointer ml-1"
              />
              Transaction
            </div>
            <div className="col-span-2">Account</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredTransactions.map((tx) => {
              const TxIcon = getIconForCategory(tx.category);
              const symbol = getCurrencySymbol(tx.currency);
              const isCredit = tx.type === 'income';
              const isSelected = selectedTxIds.includes(tx.id);

              return (
                <div 
                  key={tx.id} 
                  onClick={() => {
                      setSelectedTx({ ...tx, symbol, icon: TxIcon, isCredit });
                      setTxNotes(tx.notes || "");
                      setReverseBalance(true); // reset reverse balance choice
                  }}
                  className={`flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-4 md:items-center cursor-pointer transition-colors group ${isSelected ? 'bg-[var(--color-brand-deep)]/5 dark:bg-[var(--color-brand-deep)]/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div className="col-span-4 flex items-center justify-between md:justify-start gap-3">
                    <div className="flex items-center gap-3">
                      
                      <div className="flex items-center justify-center pl-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                         <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => toggleSelectTx(tx.id, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-[var(--color-brand-deep)] focus:ring-[var(--color-brand-deep)]/50 bg-transparent cursor-pointer"
                         />
                      </div>

                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isCredit
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20" 
                          : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/20"
                      }`}>
                        <TxIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-brand-deep)] transition-colors line-clamp-1">{tx.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden mt-0.5">{tx.date.split(' ')[0]} • {tx.accountName}</p>
                      </div>
                    </div>
                    <div className={`md:hidden text-right font-bold ${
                      isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                    }`}>
                      {isCredit ? '+' : '-'}{symbol}{formatMoney(tx.amount)}
                    </div>
                  </div>

                  <div className="hidden md:block col-span-2 text-sm text-slate-600 dark:text-slate-300">{tx.accountName}</div>
                  <div className="hidden md:block col-span-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{tx.date.split(' ')[0]}</p>
                  </div>
                  <div className="hidden md:flex col-span-2 items-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'completed' 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  
                  <div className={`hidden md:block col-span-2 text-right font-bold ${
                    isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                  }`}>
                    {isCredit ? '+' : '-'}{symbol}{formatMoney(tx.amount)}
                  </div>
                </div>
              );
            })}

            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No transactions found.
              </div>
            )}
          </div>

          {/* LOAD MORE BUTTON */}
          {filteredTransactions.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-black/10 flex justify-center">
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================= */}
      {/* ADD TRANSACTION DRAWER                    */}
      {/* ========================================= */}
      
      {isAddOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => !isSubmitting && setIsAddOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isAddOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ADD DRAWER CONTENT (Unchanged visually, functionally intact) */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Transaction</h3>
          <button onClick={() => !isSubmitting && setIsAddOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex p-1 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
            <button onClick={() => setAddMode("scan")} disabled={isSubmitting} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${addMode === "scan" ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-300"}`}>
              <Camera className="w-4 h-4" /> AI Smart Scan
            </button>
            <button onClick={() => setAddMode("manual")} disabled={isSubmitting} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${addMode === "manual" ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-300"}`}>
              <FileText className="w-4 h-4" /> Manual Entry
            </button>
          </div>

          {addMode === "scan" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Destination Account</label>
                {myAccounts.length === 0 ? (
                  <p className="text-sm text-rose-500">Please create a financial account first.</p>
                ) : (
                  <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium">
                    {myAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                  </select>
                )}
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Tap to scan or upload</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Supports Receipt Photos, PDFs, and Bank CSVs. KORE AI will extract merchant, date, and amount automatically.</p>
                <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-md">Choose File</button>
              </div>
            </div>
          )}

          {addMode === "manual" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex p-1 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 mb-2">
                <button onClick={() => setTxType("expense")} disabled={isSubmitting} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${txType === "expense" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Money Out (Expense)</button>
                <button onClick={() => setTxType("income")} disabled={isSubmitting} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${txType === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Money In (Income)</button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isSubmitting} placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Merchant / Description</label>
                <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} disabled={isSubmitting} placeholder="e.g. Uber, Starbucks, Rent" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account</label>
                  {myAccounts.length === 0 ? (
                    <p className="text-xs text-rose-500 mt-3">Create an account first.</p>
                  ) : (
                    <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none">
                      {myAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSubmitting} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none">
                  <option value="Expense">General Expense</option>
                  <option value="Income">Income / Salary</option>
                  <option value="Dining">Food & Dining</option>
                  <option value="Shopping">Retail / Shopping</option>
                  <option value="Software">Software / Subscriptions</option>
                  <option value="Travel">Travel</option>
                  <option value="Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3">
          <button onClick={() => setIsAddOpen(false)} disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">Cancel</button>
          {addMode === "manual" ? (
             <button onClick={handleSaveTransaction} disabled={isSubmitting || myAccounts.length === 0} className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 disabled:opacity-70">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save Record
             </button>
          ) : (
             <button className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20">Start Scan</button>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* RECEIPT VIEW DRAWER                       */}
      {/* ========================================= */}
      
      {selectedTx && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={closeDrawer}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          selectedTx ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Details</h3>
          
          <div className="flex items-center gap-2">
              {!confirmDelete && (
                <>
                  <button 
                      onClick={() => setConfirmDelete(true)} 
                      disabled={isSubmitting}
                      className="p-2 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                      title="Delete Transaction"
                  >
                      <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={closeDrawer} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
          </div>
        </div>

        {selectedTx && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col relative">
            
            {/* INLINE DELETE CONFIRMATION PANEL */}
            {confirmDelete && (
              <div className="mb-6 flex flex-col gap-3 animate-in slide-in-from-top-4 duration-300 bg-rose-50 dark:bg-rose-500/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Delete this transaction?</p>
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 rounded-xl border border-rose-100 dark:border-rose-500/20 cursor-pointer">
                  <input 
                     type="checkbox" 
                     checked={reverseBalance} 
                     onChange={(e) => setReverseBalance(e.target.checked)}
                     className="w-5 h-5 rounded border-slate-300 text-rose-500 focus:ring-rose-500 bg-transparent"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reverse account balance</span>
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={handleDeleteTransaction} disabled={isSubmitting} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors w-full flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} disabled={isSubmitting} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors w-full">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className={`transition-opacity duration-300 ${confirmDelete ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex flex-col items-center justify-center py-6 mb-6 border-b border-slate-100 dark:border-white/5">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                      selectedTx.isCredit
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                    }`}>
                      <selectedTx.icon className="w-8 h-8" />
                    </div>
                  <h2 className={`text-4xl font-bold mb-1 ${selectedTx.isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                    {selectedTx.isCredit ? '+' : '-'}{selectedTx.symbol}{formatMoney(selectedTx.amount)}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedTx.title}</p>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${selectedTx.status === 'completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                      {selectedTx.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Date</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedTx.date}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Account</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedTx.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Category</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedTx.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Transaction ID</span>
                    <span className="text-xs font-mono text-slate-400">{selectedTx.id}</span>
                  </div>
                  
                  <div className="mt-8 pb-4">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Personal Notes</label>
                    <textarea 
                        value={txNotes}
                        onChange={(e) => setTxNotes(e.target.value)}
                        placeholder="Add a note or attach a receipt reference..." 
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                    <button 
                        onClick={handleSaveNotes}
                        disabled={isSubmitting || txNotes === (selectedTx.notes || "")}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl text-sm font-bold transition-colors hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Notes
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
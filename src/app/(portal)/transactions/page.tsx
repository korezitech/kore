"use client";

import { useState } from "react";
import { 
  Search, Filter, Download, ArrowUpRight, ArrowDownLeft, 
  Store, Wifi, Plane, Receipt, Briefcase, Coffee, ShoppingBag, X, 
  Plus, UploadCloud, Camera, FileText, Loader2
} from "lucide-react";

// Robust dummy data
const transactionsData = [
  { id: "TX-9928", title: "Korezi Store Payout", merchant: "Paystack", category: "Income", account: "Korezi Store", date: "Apr 04, 2026", time: "10:23 AM", amount: 450000, currency: "₦", type: "credit", status: "completed", icon: Store },
  { id: "TX-9927", title: "AWS Hosting", merchant: "Amazon Web Services", category: "Software", account: "GBP Vault", date: "Apr 03, 2026", time: "2:15 PM", amount: 120.00, currency: "£", type: "debit", status: "completed", icon: Wifi },
  { id: "TX-9926", title: "Loan Repayment", merchant: "Sarah Jenkins", category: "Transfer", account: "Naira Checking", date: "Apr 02, 2026", time: "09:00 AM", amount: 50000, currency: "₦", type: "credit", status: "completed", icon: ArrowUpRight },
  { id: "TX-9925", title: "Office Supplies", merchant: "Stationery Hub", category: "Expense", account: "Naira Checking", date: "Apr 01, 2026", time: "11:30 AM", amount: 32500, currency: "₦", type: "debit", status: "completed", icon: Receipt },
  { id: "TX-9924", title: "Client Payment", merchant: "TechCorp Global", category: "Income", account: "USD Savings", date: "Mar 28, 2026", time: "4:45 PM", amount: 1200.00, currency: "$", type: "credit", status: "pending", icon: Briefcase },
  { id: "TX-9923", title: "Coffee & Lunch", merchant: "Cafe Neo", category: "Dining", account: "Naira Checking", date: "Mar 27, 2026", time: "1:15 PM", amount: 12500, currency: "₦", type: "debit", status: "completed", icon: Coffee },
  { id: "TX-9922", title: "Flight to London", merchant: "British Airways", category: "Travel", account: "AMEX Platinum", date: "Mar 25, 2026", time: "8:20 PM", amount: 450.00, currency: "$", type: "debit", status: "completed", icon: Plane },
  { id: "TX-9921", title: "Apple Store", merchant: "Apple Inc.", category: "Shopping", account: "AMEX Platinum", date: "Mar 20, 2026", time: "3:10 PM", amount: 2499.00, currency: "$", type: "debit", status: "completed", icon: ShoppingBag },
];

const myAccounts = ["Naira Checking", "GBP Vault", "USD Savings", "Korezi Store", "AMEX Platinum", "NGX Portfolio"];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Drawer States
  const [selectedTx, setSelectedTx] = useState<typeof transactionsData[0] | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "scan">("scan"); // Default to the cool new feature
  
  // Loading state for the "Load More" button
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredTransactions = transactionsData.filter(tx => 
    tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.merchant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate a network request
    setTimeout(() => setIsLoadingMore(false), 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh]">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Transactions</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Your unified financial ledger across all accounts.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
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
      <div className="glass-panel p-2 md:p-3 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by merchant, description, or amount..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* THE LEDGER */}
      <div className="glass-panel overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Transaction</div>
          <div className="col-span-2">Account</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {filteredTransactions.map((tx) => (
            <div 
              key={tx.id} 
              onClick={() => setSelectedTx(tx)}
              className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-4 md:items-center hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className="col-span-4 flex items-center justify-between md:justify-start gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'credit' 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                  }`}>
                    <tx.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-brand-deep)] transition-colors line-clamp-1">{tx.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden mt-0.5">{tx.date} • {tx.account}</p>
                  </div>
                </div>
                <div className={`md:hidden text-right font-bold ${
                  tx.type === 'credit' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                }`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.currency}{formatMoney(tx.amount)}
                </div>
              </div>

              <div className="hidden md:block col-span-2 text-sm text-slate-600 dark:text-slate-300">{tx.account}</div>
              <div className="hidden md:block col-span-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">{tx.date}</p>
                <p className="text-xs text-slate-400">{tx.time}</p>
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
                tx.type === 'credit' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
              }`}>
                {tx.type === 'credit' ? '+' : '-'}{tx.currency}{formatMoney(tx.amount)}
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No transactions found matching "{searchTerm}"
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

      {/* ========================================= */}
      {/* 1. ADD TRANSACTION DRAWER                 */}
      {/* ========================================= */}
      
      {isAddOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsAddOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isAddOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Transaction</h3>
          <button onClick={() => setIsAddOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TABS */}
          <div className="flex p-1 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setAddMode("scan")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${addMode === "scan" ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-300"}`}
            >
              <Camera className="w-4 h-4" /> AI Smart Scan
            </button>
            <button 
              onClick={() => setAddMode("manual")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${addMode === "manual" ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-300"}`}
            >
              <FileText className="w-4 h-4" /> Manual Entry
            </button>
          </div>

          {/* AI SCANNER MODE */}
          {addMode === "scan" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Destination Account</label>
                <select className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium">
                  {myAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Tap to scan or upload</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Supports Receipt Photos, PDFs, and Bank CSVs. KORE AI will extract merchant, date, and amount automatically.</p>
                <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-md">
                  Choose File
                </button>
              </div>
            </div>
          )}

          {/* MANUAL ENTRY MODE */}
          {addMode === "manual" && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Amount</label>
                <input type="number" placeholder="0.00" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Merchant / Description</label>
                <input type="text" placeholder="e.g. Uber, Starbucks, Rent" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account</label>
                  <select className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50">
                    {myAccounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Date</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>
            </div>
          )}

        </div>
        
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3">
          <button onClick={() => setIsAddOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20">
            {addMode === "scan" ? "Start Scan" : "Save Record"}
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. RECEIPT VIEW DRAWER (Existing)           */}
      {/* ========================================= */}
      
      {selectedTx && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setSelectedTx(null)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          selectedTx ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Details</h3>
          <button onClick={() => setSelectedTx(null)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedTx && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col items-center justify-center py-6 mb-6 border-b border-slate-100 dark:border-white/5">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  selectedTx.type === 'credit' 
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                }`}>
                  <selectedTx.icon className="w-8 h-8" />
                </div>
              <h2 className={`text-4xl font-bold mb-1 ${selectedTx.type === 'credit' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                {selectedTx.type === 'credit' ? '+' : '-'}{selectedTx.currency}{formatMoney(selectedTx.amount)}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedTx.merchant}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${selectedTx.status === 'completed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                  {selectedTx.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-sm text-slate-500 dark:text-slate-400">Date & Time</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedTx.date}, {selectedTx.time}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-sm text-slate-500 dark:text-slate-400">Account</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedTx.account}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-sm text-slate-500 dark:text-slate-400">Category</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-sm text-slate-500 dark:text-slate-400">Transaction ID</span>
                <span className="text-xs font-mono text-slate-400">{selectedTx.id}</span>
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Personal Notes</label>
              <textarea placeholder="Add a note or attach a receipt reference..." className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all min-h-[100px] resize-none"></textarea>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
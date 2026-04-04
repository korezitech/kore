"use client";

import { useState } from "react";
import { 
  Trash2, RotateCcw, AlertOctagon, Clock, 
  Landmark, ArrowRightLeft, Target, ShieldAlert, X
} from "lucide-react";

// Mock Data for deleted items
const initialDeletedItems = [
  { id: 1, type: "Transaction", name: "Uber Ride - Lagos", amount: "₦4,500", deletedAt: "Today, 10:45 AM", daysLeft: 30, icon: ArrowRightLeft, color: "text-slate-500" },
  { id: 2, type: "Account", name: "Old Zenith Savings", amount: "₦0.00", deletedAt: "Yesterday, 2:15 PM", daysLeft: 29, icon: Landmark, color: "text-blue-500" },
  { id: 3, type: "Milestone", name: "New Laptop Fund", amount: "₦150,000 saved", deletedAt: "Apr 1, 2026", daysLeft: 27, icon: Target, color: "text-[var(--color-brand-deep)]" },
  { id: 4, type: "Transaction", name: "Netflix Subscription", amount: "$15.99", deletedAt: "Mar 20, 2026", daysLeft: 15, icon: ArrowRightLeft, color: "text-slate-500" },
];

export default function RecycleBinPage() {
  const [deletedItems, setDeletedItems] = useState(initialDeletedItems);
  const [filter, setFilter] = useState<"All" | "Transaction" | "Account" | "Milestone">("All");

  const filteredItems = deletedItems.filter(item => filter === "All" || item.type === filter);

  const handleRestore = (id: number) => {
    // In a real app, this would hit your backend to update the DB status
    setDeletedItems(prev => prev.filter(item => item.id !== id));
  };

  const handlePermanentDelete = (id: number) => {
    setDeletedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEmptyBin = () => {
    if(confirm("Are you sure you want to permanently delete all items? This cannot be undone.")) {
      setDeletedItems([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto min-h-[80vh]">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Recycle Bin</h2>
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 px-2.5 py-1 rounded-full shadow-sm border border-rose-200 dark:border-rose-500/20">
              {deletedItems.length} Items
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Recover deleted records or permanently erase them.</p>
        </div>
        
        <button 
          onClick={handleEmptyBin}
          disabled={deletedItems.length === 0}
          className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" /> Empty Bin
        </button>
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
          {(["All", "Transaction", "Account", "Milestone"] as const).map((tab) => (
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
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
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
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.amount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                  <div className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {item.daysLeft} days left
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePermanentDelete(item.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      title="Delete Permanently"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleRestore(item.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-sm font-bold transition-all"
                    >
                      <RotateCcw className="w-4 h-4" /> Restore
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
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
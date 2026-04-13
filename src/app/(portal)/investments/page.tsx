"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  TrendingUp, TrendingDown, PieChart, Activity, DollarSign, 
  Bitcoin, LineChart, Plus, X, Briefcase, RefreshCw, Trash2, 
  Eye, EyeOff, MoreHorizontal, Edit3, AlertTriangle, CheckCircle2, Loader2
} from "lucide-react";

import { getUserInvestments, createInvestment, updateInvestment, deleteInvestment, getLiveAssetPrices } from "@/actions/investmentActions";

type ConfirmConfig = {
  title: string;
  message: string;
  actionText: string;
  actionColor: string;
  iconColor: string;
  onConfirm: () => Promise<void> | void;
  isAlertOnly?: boolean;
};

export default function InvestmentsPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [showAmounts, setShowAmounts] = useState(true);
  const [portfolioView, setPortfolioView] = useState<"USD" | "GBP" | "NGN">("USD");
  
  const [investments, setInvestments] = useState<any[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, { price: number, change24h: number }>>({});
  const [isFetching, setIsFetching] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Form States
  const [addForm, setAddForm] = useState({
    name: "",
    ticker: "",
    type: "Stock",
    region: "USD",
    shares: "",
    avgPrice: ""
  });

  useEffect(() => {
    if (userId) {
      loadData();
    } else if (status === "unauthenticated") {
      setIsFetching(false);
    }
  }, [userId, status]);

  const loadData = async () => {
    setIsFetching(true);
    const invData = await getUserInvestments(userId);
    setInvestments(invData || []);
    
    if (invData && invData.length > 0) {
        const prices = await getLiveAssetPrices(invData);
        setLivePrices(prices);
    }
    
    setIsFetching(false);
  };

  const handleManualRefresh = async () => {
      setIsRefreshing(true);
      if (investments.length > 0) {
          const prices = await getLiveAssetPrices(investments);
          setLivePrices(prices);
      }
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setConfirmConfig({
      title, message,
      actionText: "Got it",
      actionColor: type === 'error' ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700",
      iconColor: type === 'error' ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      isAlertOnly: true,
      onConfirm: () => { setIsConfirmModalOpen(false); }
    });
    setIsConfirmModalOpen(true);
  };

  const getAssetIcon = (type: string) => {
      if (type === 'Crypto') return Bitcoin;
      if (type === 'ETF') return PieChart;
      if (type === 'Bond') return Briefcase;
      return LineChart;
  };

  // --- MERGE DB DATA WITH LIVE PRICES ---
  const activeHoldings = investments.filter(inv => inv.region === portfolioView).map(inv => {
      const liveData = livePrices[inv.ticker] || { price: parseFloat(inv.avgPrice), change24h: 0 };
      return {
          ...inv,
          shares: parseFloat(inv.shares),
          avgPrice: parseFloat(inv.avgPrice),
          currentPrice: liveData.price,
          change24h: liveData.change24h,
          isPositive: liveData.change24h >= 0
      };
  });

  let currencySymbol = "$";
  let sectionTitle = "US & Global Assets";
  if (portfolioView === "GBP") { currencySymbol = "£"; sectionTitle = "UK & Global Assets"; } 
  else if (portfolioView === "NGN") { currencySymbol = "₦"; sectionTitle = "Local Nigerian Assets"; }

  // --- DYNAMIC CALCULATIONS ---
  const totalBalance = activeHoldings.reduce((sum, item) => sum + (item.shares * item.currentPrice), 0);
  const totalCostBasis = activeHoldings.reduce((sum, item) => sum + (item.shares * item.avgPrice), 0);
  const allTimePnL = totalBalance - totalCostBasis;
  const pnlPercentage = totalCostBasis > 0 ? (allTimePnL / totalCostBasis) * 100 : 0;

  // Calculate 24h PnL strictly based on the 24h change percentage of current holdings
  const dayReturn = activeHoldings.reduce((sum, item) => {
      const prevPrice = item.currentPrice / (1 + (item.change24h / 100));
      return sum + ((item.currentPrice - prevPrice) * item.shares);
  }, 0);
  const dayReturnPercentage = totalBalance > 0 ? (dayReturn / (totalBalance - dayReturn)) * 100 : 0;

  // Drawer Handlers
  const openAddDrawer = () => {
    setDrawerMode("add");
    setSelectedAsset(null);
    setAddForm({ name: "", ticker: "", type: "Stock", region: portfolioView, shares: "", avgPrice: "" });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (asset: any) => {
    setDrawerMode("edit");
    setSelectedAsset(asset);
    setAddForm({ 
        name: asset.name, 
        ticker: asset.ticker, 
        type: asset.type, 
        region: asset.region, 
        shares: asset.shares.toString(), 
        avgPrice: asset.avgPrice.toString() 
    });
    setIsDrawerOpen(true);
  };

  const handleSaveAsset = async () => {
      if (!addForm.name || !addForm.ticker || !addForm.shares || !addForm.avgPrice) {
          return showAlert("Missing Information", "Please fill in all required asset fields.");
      }
      setIsSubmitting(true);
      
      let result;
      if (drawerMode === "add") {
        result = await createInvestment({ ...addForm, userId });
      } else {
        result = await updateInvestment({ ...addForm, investmentId: selectedAsset.id, userId });
      }

      if (result.success) {
          await loadData();
          setIsDrawerOpen(false);
          showAlert("Success", `Asset successfully ${drawerMode === 'add' ? 'logged' : 'updated'}.`, "success");
      } else {
          showAlert("Action Failed", result.error);
      }
      setIsSubmitting(false);
  };

  const handleDeleteAsset = () => {
    if (!selectedAsset) return;
    setConfirmConfig({
      title: "Delete Asset",
      message: `Are you sure you want to remove ${selectedAsset.name} from your portfolio?`,
      actionText: "Delete Asset",
      actionColor: "bg-rose-600 hover:bg-rose-700",
      iconColor: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      isAlertOnly: false,
      onConfirm: async () => {
        const result = await deleteInvestment(selectedAsset.id, userId);
        if (result.success) {
          await loadData(); 
          setIsDrawerOpen(false);
          setIsConfirmModalOpen(false);
        } else {
          showAlert("Error", "Error deleting asset: " + result.error);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-brand-deep)]" />
        <p className="text-sm font-semibold">Syncing live market data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh] pb-24">
        
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Investment Portfolio</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Live prices auto-updating</p>
              <button onClick={handleManualRefresh} disabled={isRefreshing} className="p-1 text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 rounded-full transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <button 
            onClick={openAddDrawer}
            className="flex items-center justify-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 hover:scale-105 active:scale-95 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" /> Log Holding
          </button>
        </div>

        {/* PORTFOLIO REGION TOGGLE (3-WAY) */}
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-xl w-max shadow-inner border border-black/5 dark:border-white/5 max-w-full">
          <button
            onClick={() => setPortfolioView("USD")}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              portfolioView === "USD" 
                ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Global (USD)
          </button>
          <button
            onClick={() => setPortfolioView("GBP")}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              portfolioView === "GBP" 
                ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Global (GBP)
          </button>
          <button
            onClick={() => setPortfolioView("NGN")}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              portfolioView === "NGN" 
                ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Local (NGN)
          </button>
        </div>

        {/* TOP ROW: Portfolio Hero & Allocation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* HERO: Total Value */}
          <div className="md:col-span-2 glass-panel p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-8 opacity-5 dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0">
              <TrendingUp className="w-64 h-64 text-[var(--color-brand-deep)]" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Balance</p>
                  <button 
                    onClick={() => setShowAmounts(!showAmounts)} 
                    className="text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors p-1 -mt-1"
                    title={showAmounts ? "Hide amounts" : "Show amounts"}
                  >
                    {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {showAmounts ? `${currencySymbol}${formatMoney(totalBalance)}` : "••••••"}
                </h2>
              </div>
              
              <div className="flex flex-col gap-3 relative z-20">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border backdrop-blur-md ${dayReturn >= 0 ? 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-[#0A2F1D]/90 dark:border-emerald-500/20' : 'text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-400 dark:bg-[#3D0A14]/90 dark:border-rose-500/20'}`}>
                  {dayReturn >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">24h Return</p>
                    <p className="text-sm font-bold">
                      {showAmounts ? `${dayReturn >= 0 ? "+" : ""}${currencySymbol}${formatMoney(dayReturn)} (${dayReturnPercentage.toFixed(2)}%)` : "••••••"}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm border backdrop-blur-md ${allTimePnL >= 0 ? 'text-[var(--color-brand-deep)] bg-[var(--color-brand-deep)]/10 border-[var(--color-brand-deep)]/20 dark:text-[var(--color-brand-light)] dark:bg-[#2A1B3D]/90' : 'text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-400 dark:bg-[#3D0A14]/90'}`}>
                  <Activity className="w-5 h-5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">All Time P&L</p>
                    <p className="text-sm font-bold">
                      {showAmounts ? `${allTimePnL >= 0 ? "+" : ""}${currencySymbol}${formatMoney(allTimePnL)} (${pnlPercentage.toFixed(2)}%)` : "••••••"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ASSET ALLOCATION */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Allocation</h3>
              
              {totalBalance === 0 ? (
                 <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-white/10 mb-6"></div>
              ) : (
                <div className="h-4 w-full rounded-full flex overflow-hidden shadow-inner mb-6 bg-slate-200 dark:bg-white/10">
                  {/* Dynamic calculation of allocation bars based on types */}
                  {['Crypto', 'Stock', 'ETF', 'Bond'].map((type, idx) => {
                      const typeTotal = activeHoldings.filter(h => h.type === type).reduce((sum, item) => sum + (item.shares * item.currentPrice), 0);
                      if (typeTotal === 0) return null;
                      const percentage = (typeTotal / totalBalance) * 100;
                      const colors = ['bg-[var(--color-brand-deep)]', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                      return <div key={type} className={`${colors[idx]} hover:opacity-80 transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                  })}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
               {totalBalance === 0 && <p className="text-sm text-slate-500">No assets tracked.</p>}
               {['Crypto', 'Stock', 'ETF', 'Bond'].map((type, idx) => {
                  const typeTotal = activeHoldings.filter(h => h.type === type).reduce((sum, item) => sum + (item.shares * item.currentPrice), 0);
                  if (typeTotal === 0) return null;
                  const percentage = (typeTotal / totalBalance) * 100;
                  const colors = ['bg-[var(--color-brand-deep)]', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                  
                  return (
                    <div key={type} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[idx]}`}></div>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{type}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{percentage.toFixed(1)}%</span>
                    </div>
                  )
               })}
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: Holdings Ledger */}
        <div className="glass-panel overflow-hidden relative">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{sectionTitle}</h3>
            <button className="text-sm font-semibold text-[var(--color-brand-deep)] hover:underline">View Performance</button>
          </div>

          {activeHoldings.length === 0 ? (
             <div className="p-12 text-center text-slate-500">
                 <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                 <p className="text-sm">No assets found in this region.</p>
                 <button onClick={openAddDrawer} className="mt-2 text-sm font-bold text-[var(--color-brand-deep)]">+ Log your first asset</button>
             </div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/30 dark:bg-black/10">
                <div className="col-span-4">Asset</div>
                <div className="col-span-2 text-right">Live Price</div>
                <div className="col-span-2 text-right">Holdings</div>
                <div className="col-span-2 text-right">Total Value</div>
                <div className="col-span-2 text-right">24h Change</div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {activeHoldings.map((asset) => {
                  const AssetIcon = getAssetIcon(asset.type);
                  return (
                  <div 
                    key={asset.id} 
                    className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-4 md:items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group relative"
                  >
                    
                    {/* DROPDOWN MENU */}
                    <div className="absolute top-4 right-4 md:hidden z-20">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === asset.id ? null : asset.id); }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 transition-all cursor-pointer"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {openMenuId === asset.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 py-1">
                            <button onClick={() => { openEditDrawer(asset); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              <Edit3 className="w-4 h-4 text-slate-400" /> Edit Asset
                            </button>
                            <button onClick={() => { setSelectedAsset(asset); handleDeleteAsset(); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-slate-100 dark:border-white/5">
                              <Trash2 className="w-4 h-4" /> Delete Asset
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="col-span-4 flex items-center justify-between md:justify-start gap-4 pr-10 md:pr-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-white/20 transition-colors">
                          <AssetIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[var(--color-brand-deep)] transition-colors">{asset.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{asset.ticker} • {asset.type}</p>
                        </div>
                      </div>
                      <div className="md:hidden text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {showAmounts ? `${currencySymbol}${formatMoney(asset.shares * asset.currentPrice)}` : "••••••"}
                        </p>
                        <p className={`text-xs font-bold mt-0.5 ${asset.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                          {asset.isPositive ? "+" : ""}{asset.change24h}%
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-2 text-right font-medium text-slate-700 dark:text-slate-300">
                      {showAmounts ? `${currencySymbol}${formatMoney(asset.currentPrice)}` : "••••••"}
                    </div>
                    <div className="hidden md:block col-span-2 text-right">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {showAmounts ? asset.shares : "••••••"}
                      </span>
                    </div>
                    <div className="hidden md:block col-span-2 text-right font-bold text-slate-900 dark:text-white">
                      {showAmounts ? `${currencySymbol}${formatMoney(asset.shares * asset.currentPrice)}` : "••••••"}
                    </div>
                    
                    {/* Desktop Actions and Change */}
                    <div className="hidden md:flex col-span-2 justify-end items-center gap-3">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                        asset.isPositive 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                          : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                      }`}>
                        {asset.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(asset.change24h)}%
                      </span>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === asset.id ? null : asset.id); }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)]/10 transition-all cursor-pointer"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        {openMenuId === asset.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                            <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 py-1">
                              <button onClick={() => { openEditDrawer(asset); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <Edit3 className="w-4 h-4 text-slate-400" /> Edit Asset
                              </button>
                              <button onClick={() => { setSelectedAsset(asset); handleDeleteAsset(); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-slate-100 dark:border-white/5">
                                <Trash2 className="w-4 h-4" /> Delete Asset
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </>
          )}
        </div>

      </div>

      {/* ========================================= */}
      {/* LOG / EDIT HOLDING DRAWER                   */}
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
              {drawerMode === "add" ? "Log Asset Holding" : "Edit Asset Details"}
            </h3>
            <p className="text-xs text-slate-500">Update your external investments manually.</p>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Asset Name</label>
              <input 
                type="text" 
                value={addForm.name}
                onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                placeholder="e.g. Apple Inc., Bitcoin" 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Ticker / Symbol</label>
              <input 
                type="text"
                value={addForm.ticker}
                onChange={(e) => setAddForm({...addForm, ticker: e.target.value})} 
                placeholder="e.g. AAPL, BTC, MTNN" 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 uppercase" 
              />
              <p className="text-xs text-slate-500 mt-2">Required for live price tracking.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Asset Type</label>
                <select 
                  value={addForm.type}
                  onChange={(e) => setAddForm({...addForm, type: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium"
                >
                  <option value="Stock">Stock</option>
                  <option value="Crypto">Crypto</option>
                  <option value="ETF">ETF</option>
                  <option value="Bond">Bond</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Region</label>
                <select 
                  value={addForm.region}
                  onChange={(e) => setAddForm({...addForm, region: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none font-medium"
                >
                  <option value="USD">Global (USD)</option>
                  <option value="GBP">Global (GBP)</option>
                  <option value="NGN">Local (NGN)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Total Quantity</label>
                <input 
                  type="number" 
                  value={addForm.shares}
                  onChange={(e) => setAddForm({...addForm, shares: e.target.value})}
                  placeholder="0.00" 
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Avg Buy Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      {addForm.region === 'USD' ? '$' : addForm.region === 'GBP' ? '£' : '₦'}
                  </span>
                  <input 
                    type="number"
                    value={addForm.avgPrice}
                    onChange={(e) => setAddForm({...addForm, avgPrice: e.target.value})} 
                    placeholder="0.00" 
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                  />
                </div>
              </div>
            </div>
            
            {drawerMode === "edit" && (
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                 Updating this will recalculate your All-Time P&L for this asset. Current live price is fetched automatically.
               </p>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-3 items-center">
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3.5 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleSaveAsset}
            disabled={isSubmitting}
            className="flex-1 flex justify-center items-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-4 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {drawerMode === "add" ? "Save Asset" : "Update Asset"}
          </button>
        </div>
      </div>

      {/* CONFIRMATION / ALERT MODAL */}
      {isConfirmModalOpen && confirmConfig && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => !isConfirming && setIsConfirmModalOpen(false)} 
          />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full mb-4 flex items-center justify-center ${confirmConfig.iconColor}`}>
                {confirmConfig.isAlertOnly && confirmConfig.actionColor.includes("emerald") ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {confirmConfig.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                {confirmConfig.message}
              </p>
              <div className="flex gap-3 w-full">
                {!confirmConfig.isAlertOnly && (
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    disabled={isConfirming}
                    className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={async () => {
                    setIsConfirming(true);
                    await confirmConfig.onConfirm();
                    setIsConfirming(false);
                    if (confirmConfig.isAlertOnly) setIsConfirmModalOpen(false);
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
    </>
  );
}
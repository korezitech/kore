"use client";

import { useState } from "react";
import useSWR from "swr";
import { 
  TrendingUp, TrendingDown, PieChart, Activity, DollarSign, 
  Bitcoin, LineChart, Plus, X, Briefcase, RefreshCw, Trash2 
} from "lucide-react";

// --- DUMMY DATA SPLIT BY REGION ---
const usdHoldings = [
  { id: 1, name: "Apple Inc.", ticker: "AAPL", type: "Stock", shares: 45, avgPrice: 150.00, price: 173.50, change24h: 1.2, isPositive: true, icon: LineChart },
  { id: 2, name: "Bitcoin", ticker: "BTC", type: "Crypto", shares: 0.25, avgPrice: 45000.00, price: 64200.00, change24h: 5.4, isPositive: true, icon: Bitcoin },
  { id: 3, name: "Vanguard S&P 500", ticker: "VOO", type: "ETF", shares: 12.5, avgPrice: 410.00, price: 478.20, change24h: -0.3, isPositive: false, icon: PieChart },
  { id: 4, name: "Ethereum", ticker: "ETH", type: "Crypto", shares: 4.2, avgPrice: 2000.00, price: 3450.00, change24h: -2.1, isPositive: false, icon: Bitcoin },
];

const gbpHoldings = [
  { id: 5, name: "Rolls-Royce Holdings", ticker: "RR.", type: "Stock", shares: 500, avgPrice: 1.50, price: 4.10, change24h: 2.1, isPositive: true, icon: LineChart },
  { id: 6, name: "HSBC Holdings", ticker: "HSBA", type: "Stock", shares: 150, avgPrice: 5.20, price: 6.45, change24h: -0.5, isPositive: false, icon: LineChart },
  { id: 7, name: "Vanguard FTSE 100", ticker: "VUKE", type: "ETF", shares: 45, avgPrice: 30.00, price: 34.20, change24h: 0.8, isPositive: true, icon: PieChart }
];

const ngnHoldings = [
  { id: 8, name: "MTN Nigeria", ticker: "MTNN", type: "Stock", shares: 1500, avgPrice: 210.00, price: 245.50, change24h: 3.2, isPositive: true, icon: LineChart },
  { id: 9, name: "FGN Savings Bond", ticker: "FGN", type: "Bond", shares: 5000, avgPrice: 1000.00, price: 1050.00, change24h: 0.05, isPositive: true, icon: Briefcase },
  { id: 10, name: "Dangote Cement", ticker: "DANGCEM", type: "Stock", shares: 300, avgPrice: 450.00, price: 680.00, change24h: -1.5, isPositive: false, icon: LineChart },
];

// MOCK SWR FETCHER
const fetchLivePrices = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ updated: new Date().toLocaleTimeString() });
    }, 800);
  });
};

export default function InvestmentsPage() {
  const [portfolioView, setPortfolioView] = useState<"USD" | "GBP" | "NGN">("USD");
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [activeAssetId, setActiveAssetId] = useState<number | null>(null);

  // Form States
  const [assetName, setAssetName] = useState("");
  const [assetTicker, setAssetTicker] = useState("");
  const [assetShares, setAssetShares] = useState("");
  const [assetAvgPrice, setAssetAvgPrice] = useState("");

  const { data: liveData, isValidating } = useSWR('/api/live-prices', fetchLivePrices, {
    refreshInterval: 60000, 
    revalidateOnFocus: true
  });

  // Determine active data based on toggle
  let activeHoldings = usdHoldings;
  let currencySymbol = "$";
  let sectionTitle = "US & Global Assets";

  if (portfolioView === "GBP") {
    activeHoldings = gbpHoldings;
    currencySymbol = "£";
    sectionTitle = "UK & Global Assets";
  } else if (portfolioView === "NGN") {
    activeHoldings = ngnHoldings;
    currencySymbol = "₦";
    sectionTitle = "Local Nigerian Assets";
  }

  // Calculate dynamic totals
  const totalBalance = activeHoldings.reduce((sum, item) => sum + (item.shares * item.price), 0);
  const totalCostBasis = activeHoldings.reduce((sum, item) => sum + (item.shares * item.avgPrice), 0);
  const allTimePnL = totalBalance - totalCostBasis;
  const pnlPercentage = (allTimePnL / totalCostBasis) * 100;

  const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Drawer Handlers
  const openAddDrawer = () => {
    setDrawerMode("add");
    setActiveAssetId(null);
    setAssetName("");
    setAssetTicker("");
    setAssetShares("");
    setAssetAvgPrice("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (asset: any) => {
    setDrawerMode("edit");
    setActiveAssetId(asset.id);
    setAssetName(asset.name);
    setAssetTicker(asset.ticker);
    setAssetShares(asset.shares.toString());
    setAssetAvgPrice(asset.avgPrice.toString());
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh]">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Investment Portfolio</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Live prices auto-updating</p>
            {isValidating && <RefreshCw className="w-3 h-3 text-[var(--color-brand-deep)] animate-spin" />}
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
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Balance</p>
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currencySymbol}{formatMoney(totalBalance)}
              </h2>
            </div>
            
            <div className="flex flex-col gap-3 relative z-20">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-[#0A2F1D]/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">24h Return</p>
                  <p className="text-sm font-bold">+{currencySymbol}425.50 (1.2%)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-brand-deep)] bg-[var(--color-brand-deep)]/10 dark:text-[var(--color-brand-light)] dark:bg-[#2A1B3D]/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-sm border border-[var(--color-brand-deep)]/20">
                <Activity className="w-5 h-5" />
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">All Time P&L</p>
                  <p className="text-sm font-bold">{allTimePnL >= 0 ? "+" : ""}{currencySymbol}{formatMoney(allTimePnL)} ({formatMoney(pnlPercentage)}%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ASSET ALLOCATION */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Allocation</h3>
            <div className="h-4 w-full rounded-full flex overflow-hidden shadow-inner mb-6 bg-slate-200 dark:bg-white/10">
              <div className={`${portfolioView === 'USD' ? 'bg-[var(--color-brand-deep)] w-[45%]' : portfolioView === 'GBP' ? 'bg-blue-600 w-[70%]' : 'bg-emerald-500 w-[60%]'} hover:opacity-80 transition-all duration-500`}></div>
              <div className={`${portfolioView === 'USD' ? 'bg-blue-500 w-[35%]' : portfolioView === 'GBP' ? 'bg-emerald-500 w-[30%]' : 'bg-amber-500 w-[40%]'} hover:opacity-80 transition-all duration-500`}></div>
              {portfolioView === 'USD' && <div className="bg-emerald-500 w-[20%] hover:opacity-80 transition-all duration-500"></div>}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${portfolioView === 'USD' ? 'bg-[var(--color-brand-deep)]' : portfolioView === 'GBP' ? 'bg-blue-600' : 'bg-emerald-500'}`}></div>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{portfolioView === 'USD' ? 'Crypto' : 'Stocks'}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{portfolioView === 'USD' ? '45%' : portfolioView === 'GBP' ? '70%' : '60%'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${portfolioView === 'USD' ? 'bg-blue-500' : portfolioView === 'GBP' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{portfolioView === 'USD' ? 'Stocks' : portfolioView === 'GBP' ? 'ETFs' : 'Bonds'}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{portfolioView === 'USD' ? '35%' : portfolioView === 'GBP' ? '30%' : '40%'}</span>
            </div>
            {portfolioView === 'USD' && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-slate-600 dark:text-slate-300 font-medium">ETFs</span></div>
                <span className="font-bold text-slate-900 dark:text-white">20%</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: Holdings Ledger */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{sectionTitle}</h3>
          <button className="text-sm font-semibold text-[var(--color-brand-deep)] hover:underline">View Performance</button>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/30 dark:bg-black/10">
          <div className="col-span-4">Asset</div>
          <div className="col-span-2 text-right">Live Price</div>
          <div className="col-span-2 text-right">Holdings</div>
          <div className="col-span-2 text-right">Total Value</div>
          <div className="col-span-2 text-right">24h Change</div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {activeHoldings.map((asset) => (
            <div 
              key={asset.id} 
              onClick={() => openEditDrawer(asset)}
              className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-4 md:items-center hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className="col-span-4 flex items-center justify-between md:justify-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-white/20 transition-colors">
                    <asset.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[var(--color-brand-deep)] transition-colors">{asset.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{asset.ticker} • {asset.type}</p>
                  </div>
                </div>
                <div className="md:hidden text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{currencySymbol}{formatMoney(asset.shares * asset.price)}</p>
                  <p className={`text-xs font-bold mt-0.5 ${asset.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                    {asset.isPositive ? "+" : ""}{asset.change24h}%
                  </p>
                </div>
              </div>

              <div className="hidden md:block col-span-2 text-right font-medium text-slate-700 dark:text-slate-300">
                {currencySymbol}{formatMoney(asset.price)}
              </div>
              <div className="hidden md:block col-span-2 text-right">
                <span className="font-medium text-slate-900 dark:text-white">{asset.shares}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{asset.ticker}</span>
              </div>
              <div className="hidden md:block col-span-2 text-right font-bold text-slate-900 dark:text-white">
                {currencySymbol}{formatMoney(asset.shares * asset.price)}
              </div>
              <div className="hidden md:flex col-span-2 justify-end">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                  asset.isPositive 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                }`}>
                  {asset.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(asset.change24h)}%
                </span>
              </div>
            </div>
          ))}
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
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. Apple Inc., Bitcoin" 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Asset Ticker / Symbol</label>
              <input 
                type="text"
                value={assetTicker}
                onChange={(e) => setAssetTicker(e.target.value)} 
                placeholder="e.g. AAPL, BTC, MTNN" 
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 uppercase" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Total Quantity</label>
                <input 
                  type="number" 
                  value={assetShares}
                  onChange={(e) => setAssetShares(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Avg Buy Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number"
                    value={assetAvgPrice}
                    onChange={(e) => setAssetAvgPrice(e.target.value)} 
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
          {drawerMode === "edit" && (
            <button className="p-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3.5 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-4 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20"
          >
            {drawerMode === "add" ? "Save Asset" : "Update Asset"}
          </button>
        </div>
      </div>

    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, ShieldCheck, Globe, Bot, 
  TrendingUp, Lock, Sparkles, Key, BarChart3,
  ArrowDownLeft, CreditCard, LineChart, Home
} from "lucide-react";

export default function LandingPage() {
  // Interactive State for the Hero Dashboard Mockup
  const [activeCurrency, setActiveCurrency] = useState<"₦" | "£" | "$">("₦");

  const dashboardMetrics = {
    "₦": { netWorth: "45,231,000", portfolio: "18,450,000", debt: "38,500,000" },
    "£": { netWorth: "22,615.50", portfolio: "9,225.00", debt: "19,250.00" },
    "$": { netWorth: "28,500.00", portfolio: "11,500.00", debt: "24,000.00" }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans selection:bg-[var(--color-brand-deep)] selection:text-white overflow-x-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <Link href="/" className="relative flex items-center w-28 h-8 hover:opacity-80 transition-opacity">
            <Image src="/kore-coloured.png" alt="KORE Logo" fill className="block dark:hidden object-contain object-left" />
            <Image src="/kore-white.png" alt="KORE Logo" fill className="hidden dark:block object-contain object-left" />
          </Link>

          <Link href="/login" className="flex items-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[var(--color-brand-deep)]/20 hover:scale-105 active:scale-95 transition-all">
            Log In <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-[var(--color-brand-deep)]/10 dark:bg-[var(--color-brand-deep)]/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="hidden lg:flex absolute top-48 left-[10%] flex-col gap-2 p-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl rounded-2xl transform -rotate-6 animate-in slide-in-from-bottom-8 duration-700 fade-in z-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Portfolio</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">+2.4% Today</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex absolute top-64 right-[10%] flex-col gap-2 p-4 bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl rounded-2xl transform rotate-6 animate-in slide-in-from-bottom-8 duration-700 delay-150 fade-in z-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Secure Connection</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-brand-deep)]/5 dark:bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] text-xs font-bold mb-8 border border-[var(--color-brand-deep)]/10 dark:border-[var(--color-brand-deep)]/20 shadow-sm">
            <img src="/favicon.ico" alt="Kore Icon" className="w-3.5 h-3.5 object-contain" /> Private Financial Operating System
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight text-slate-900 dark:text-white">
            Master your wealth. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-deep)] to-purple-500 dark:to-purple-400">
              Command your future.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A private, token-gated platform. Track global assets, monitor debt, and leverage intelligent tools to optimize your net worth in real-time.
          </p>
          
          <div className="flex flex-col items-center justify-center">
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-8 py-4 rounded-full text-base font-bold transition-all shadow-xl shadow-[var(--color-brand-deep)]/20 hover:-translate-y-1">
              <Key className="w-5 h-5" /> Access Dashboard
            </Link>
            <p className="text-xs text-slate-500 mt-4">Authorized access only. Requires a secure activation token.</p>
          </div>
        </div>

        {/* Hero Dashboard Stylized Preview */}
        <div className="max-w-5xl mx-auto mt-20 relative z-10 perspective-1000">
          <div className="w-full h-[450px] md:h-[580px] rounded-[24px] md:rounded-[40px] bg-white/50 dark:bg-[#121826]/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col transform rotate-x-2 hover:rotate-x-0 transition-transform duration-700 ease-out">
            
            <div className="h-14 md:h-16 border-b border-slate-200/50 dark:border-white/5 flex items-center px-6 gap-4 bg-white/40 dark:bg-black/10 shrink-0">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-slate-100/50 dark:bg-white/5 h-6 w-48 rounded-md"></div>
              </div>
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 overflow-hidden">
              
              <div className="flex items-end justify-between shrink-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Worth</p>
                    
                    {/* Interactive Currency Switcher */}
                    <div className="flex bg-slate-200/50 dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/5">
                      {(["₦", "£", "$"] as const).map((sym) => (
                        <button
                          key={sym}
                          onClick={() => setActiveCurrency(sym)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                            activeCurrency === sym 
                              ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] shadow-sm" 
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white transition-all duration-300">
                      {activeCurrency}{dashboardMetrics[activeCurrency].netWorth}
                    </h3>
                    <span className="hidden md:flex items-center gap-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold">
                      <TrendingUp className="w-3 h-3" /> +2.4%
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex gap-2">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">ME</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0 mt-2 md:mt-4">
                
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4 md:gap-6">
                  
                  <div className="grid grid-cols-2 gap-4 md:gap-6 shrink-0">
                    <div className="bg-white dark:bg-[#1A2133] rounded-2xl border border-slate-200/80 dark:border-white/5 p-4 md:p-5 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <LineChart className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">+8.2%</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Global Portfolio</p>
                        <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white transition-all duration-300">
                          {activeCurrency}{dashboardMetrics[activeCurrency].portfolio}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#1A2133] rounded-2xl border border-slate-200/80 dark:border-white/5 p-4 md:p-5 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                          <Home className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">Mortgage</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Remaining Debt</p>
                        <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white transition-all duration-300">
                          {activeCurrency}{dashboardMetrics[activeCurrency].debt}
                        </p>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full mt-2 md:mt-3 overflow-hidden">
                          <div className="h-full bg-rose-500 w-[14%] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1A2133] rounded-2xl border border-slate-200/80 dark:border-white/5 p-4 md:p-5 flex flex-col shadow-sm flex-1 min-h-[140px]">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Recent Activity</p>
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Enterprise Dividend</p>
                            <p className="text-[10px] text-slate-500 mt-1">Today, 10:23 AM</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+₦450,000</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Server Infrastructure</p>
                            <p className="text-[10px] text-slate-500 mt-1">Yesterday, 2:15 PM</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">-£120.00</p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="hidden md:flex col-span-1 bg-gradient-to-b from-[var(--color-brand-deep)]/10 to-transparent dark:from-[var(--color-brand-deep)]/20 dark:to-transparent rounded-2xl border border-[var(--color-brand-deep)]/20 p-5 flex-col shadow-inner">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-[var(--color-brand-deep)] rounded-lg text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">KORE Brain</p>
                  </div>
                  
                  <div className="bg-white dark:bg-[#1A2133] p-4 rounded-xl rounded-tl-sm border border-[var(--color-brand-deep)]/10 shadow-sm mb-3 relative">
                    <Sparkles className="w-3 h-3 absolute top-2 right-2 text-[var(--color-brand-deep)]/50" />
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Based on your recent <strong>Enterprise Dividends</strong>, you can safely increase your mortgage payment by <strong>₦50,000/mo</strong> and pay it off 3 years early.
                    </p>
                  </div>
                  
                  <div className="mt-auto flex justify-end">
                    <div className="bg-[var(--color-brand-deep)] text-white px-3 py-2 rounded-xl rounded-tr-sm text-xs font-bold shadow-md cursor-pointer hover:bg-[var(--color-brand-light)] transition-colors">
                      Update Allocation
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-24 px-6 bg-slate-100/50 dark:bg-[#080B14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Financial Clarity.</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Engineered for those who require absolute precision and privacy over their capital.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            
            <div className="md:col-span-2 bg-white dark:bg-[#121826] rounded-3xl p-8 border border-slate-200 dark:border-white/5 flex flex-col justify-between group hover:border-[var(--color-brand-deep)]/30 transition-colors overflow-hidden relative shadow-sm">
              <div className="absolute -right-10 -top-10 text-slate-100 dark:text-white/5 group-hover:scale-110 transition-transform duration-500">
                <Globe className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 shadow-sm">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Borderless Tracking</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">Manage Naira, Pounds, and Dollars natively. The system handles exchange conversions to provide an accurate, unified net worth.</p>
              </div>
            </div>

            <div className="md:col-span-1 bg-gradient-to-br from-[var(--color-brand-deep)] to-[#3A245A] rounded-3xl p-8 text-white flex flex-col justify-between group shadow-lg shadow-[var(--color-brand-deep)]/10">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">KORE Brain</h3>
                <p className="text-white/80 text-sm leading-relaxed">Built-in financial intelligence. Analyze spending patterns and calculate precise debt payoff trajectories instantly.</p>
              </div>
            </div>

            <div className="md:col-span-1 bg-white dark:bg-[#121826] rounded-3xl p-8 border border-slate-200 dark:border-white/5 flex flex-col justify-between group hover:border-[var(--color-brand-deep)]/30 transition-colors shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Live Portfolio</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Monitor your global stocks, ETFs, crypto, and local bonds in one secure ledger.</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-white dark:bg-[#121826] rounded-3xl p-8 border border-slate-200 dark:border-white/5 flex flex-col justify-between overflow-hidden relative group hover:border-[var(--color-brand-deep)]/30 transition-colors shadow-sm">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white/10 text-white flex items-center justify-center mb-6 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">Your data remains yours. The platform utilizes advanced encryption, secure authentication, and strict invite-only access controls to ensure total privacy.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className="py-32 px-6 relative overflow-hidden bg-white dark:bg-[#0B0F19]">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
            <img src="/favicon.ico" alt="Kore" className="w-8 h-8 opacity-80" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Secure Access Gateway</h2>
          <p className="text-base text-slate-500 dark:text-slate-400 mb-10">
            Access to the KORE environment is restricted. Please proceed to the secure login gateway to authenticate your session.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full text-sm font-bold transition-all shadow-lg hover:scale-105">
              <Lock className="w-4 h-4" /> Proceed to Login
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#080B14] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-3 opacity-50 grayscale">
            <Image src="/kore-coloured.png" alt="KORE Logo" width={80} height={24} className="block dark:hidden object-contain" />
            <Image src="/kore-white.png" alt="KORE Logo" width={80} height={24} className="hidden dark:block object-contain" />
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} KORE. Private System. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
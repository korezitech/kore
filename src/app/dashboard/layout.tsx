"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  TrendingUp,
  HandCoins,
  Target,
  Bot,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// We keep the main navigation items here
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowRightLeft },
  { name: "Investments", href: "/dashboard/investments", icon: TrendingUp },
  { name: "Loans", href: "/dashboard/loans", icon: HandCoins },
  { name: "Goals", href: "/dashboard/goals", icon: Target },
  { name: "AI Brain", href: "/dashboard/ai", icon: Bot },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for desktop sidebar

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      
      {/* DESKTOP SIDEBAR - Hidden on mobile, collapsible on desktop */}
      <aside 
        className={`hidden md:flex flex-col m-4 glass-panel transition-all duration-300 relative ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Collapse Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-slate-200 dark:bg-slate-800 rounded-full p-1 border border-slate-300 dark:border-slate-700 hover:scale-110 transition-transform z-10"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Logo Area */}
        <div className={`p-6 flex items-center border-b border-black/5 dark:border-white/10 ${isCollapsed ? "justify-center px-0" : ""}`}>
          {isCollapsed ? (
             <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-deep)] flex items-center justify-center text-white font-bold text-xl">
               K
             </div>
          ) : (
            <div className="relative flex items-center w-32 h-10">
              <Image src="/kore-coloured.png" alt="KORE Logo" width={128} height={40} className="block dark:hidden object-contain object-left" />
              <Image src="/kore-white.png" alt="KORE Logo" width={128} height={40} className="hidden dark:block object-contain object-left" />
            </div>
          )}
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={`flex items-center gap-3 py-3 rounded-xl transition-all ${
                  isCollapsed ? "justify-center px-0" : "px-4"
                } ${
                  isActive 
                    ? "bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] font-medium" 
                    : "text-slate-600 hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-black/5 dark:border-white/10">
          <button title="Logout" className={`flex items-center gap-3 py-3 w-full rounded-xl text-slate-600 hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/5 transition-all ${isCollapsed ? "justify-center px-0" : "px-4"}`}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      {/* Added pb-24 on mobile so the floating menu doesn't cover content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-20 md:pb-0">
        
        {/* Top Header */}
        <header className="h-24 flex items-center justify-between px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white capitalize truncate">
            {pathname === "/dashboard" ? "Overview" : pathname.split("/").pop()}
          </h1>
          
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 rounded-full glass-panel hover:scale-105 transition-transform"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-[var(--color-brand-deep)]" />}
              </button>
            )}
            
            <Link href="/dashboard/profile" className="w-11 h-11 rounded-full bg-gradient-to-tr from-[var(--color-brand-deep)] to-[var(--color-brand-light)] p-[2px] cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                <span className="font-bold text-sm text-[var(--color-brand-deep)]">ME</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Dashboard Widgets Go Here */}
        <div className="flex-1 overflow-auto px-6 md:px-8 pt-0">
          {children}
        </div>
      </main>

      {/* MOBILE FLOATING BOTTOM MENU */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 glass-panel flex items-center justify-around p-2 z-50">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? "text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)]" 
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
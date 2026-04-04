"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard, ArrowRightLeft, TrendingUp, HandCoins, Target, Bot,
  Sun, Moon, LogOut, ChevronLeft, ChevronRight, Bell, Settings, User, Landmark
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Landmark },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Investments", href: "/investments", icon: TrendingUp },
  { name: "Loans & Debt", href: "/loans", icon: HandCoins },
  { name: "Milestones", href: "/goals", icon: Target },
  { name: "KORE Brain", href: "/ai", icon: Bot },
];

// Dummy data for notifications
const notifications = [
  { id: 1, title: "Stock Alert", message: "AAPL is up 4% today.", time: "2h ago", unread: true },
  { id: 2, title: "Transfer Complete", message: "£500 sent to Savings.", time: "5h ago", unread: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  
  // State for interactive menus
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Refs to detect clicks outside the menus
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Mock User First Name (Will be dynamic when DB is connected)
  const userFirstName = "Korede";

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300">
      
      {/* PRO DESKTOP SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col border-r border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-2xl transition-all duration-300 relative z-20 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-8 bg-white dark:bg-slate-900 rounded-full p-1.5 border border-slate-200 dark:border-white/10 shadow-sm hover:scale-110 transition-transform z-30 text-slate-500 dark:text-slate-400"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`h-20 flex items-center border-b border-slate-200/60 dark:border-white/5 ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
          {isCollapsed ? (
             <div className="w-8 h-8 relative flex items-center justify-center drop-shadow-md hover:scale-105 transition-transform cursor-pointer">
               <img src="/favicon.ico" alt="KORE Icon" className="w-full h-full object-contain" />
             </div>
          ) : (
            <div className="relative flex items-center w-32 h-10">
              <Image src="/kore-coloured.png" alt="KORE Logo" width={128} height={40} className="block dark:hidden object-contain object-left" />
              <Image src="/kore-white.png" alt="KORE Logo" width={128} height={40} className="hidden dark:block object-contain object-left" />
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Menu</p>}
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/") && item.href !== "/dashboard";
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={`flex items-center gap-3 py-2.5 rounded-xl transition-all group ${
                  isCollapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive 
                    ? "bg-[var(--color-brand-deep)]/10 dark:bg-[var(--color-brand-deep)]/20 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] font-medium" 
                    : "text-slate-600 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'drop-shadow-sm' : ''}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60 dark:border-white/5">
          <button title="Logout" className={`flex items-center gap-3 py-2.5 w-full rounded-xl text-slate-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:text-slate-400 transition-all ${isCollapsed ? "justify-center px-0" : "px-3"}`}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl absolute top-0 left-0 right-0 z-10">
          
          {/* Dynamic Greeting */}
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {mounted ? `${getGreeting()}, ${userFirstName}` : ""}
          </h1>
          
          <div className="flex items-center gap-3 md:gap-5">
            {mounted && (
              <>
                {/* INTERACTIVE NOTIFICATION BELL */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 rounded-full text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/10 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                  </button>
                  
                  {/* Notification Dropdown - Fixed for Mobile */}
                  {showNotifications && (
                    <div className="fixed top-20 left-4 right-4 md:absolute md:top-full md:left-auto md:-right-4 md:mt-2 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl md:shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                        <span className="text-xs font-semibold text-[var(--color-brand-deep)] cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div key={notif.id} className={`p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer ${notif.unread ? 'bg-slate-50/50 dark:bg-white/5' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm ${notif.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{notif.title}</h4>
                              <span className="text-[10px] font-medium text-slate-400">{notif.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* THEME TOGGLE */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2.5 rounded-full text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/10 transition-colors hidden sm:block"
                >
                  {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-[var(--color-brand-deep)]" />}
                </button>
              </>
            )}
            
            <div className="h-6 w-[1px] bg-slate-300 dark:bg-white/10 mx-1 hidden md:block"></div>

            {/* INTERACTIVE PROFILE AVATAR */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 group outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-brand-deep)] to-[var(--color-brand-light)] p-[2px] shadow-sm group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                    <span className="font-bold text-xs text-[var(--color-brand-deep)]">KA</span>
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 p-2">
                  <div className="px-3 py-3 border-b border-slate-100 dark:border-white/5 mb-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Korede Ajayi</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">korede@korefinance.com</p>
                  </div>
                  
                  <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <User className="w-4 h-4" /> Profile Settings
                  </Link>
                  <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" /> Admin Panel
                  </Link>
                  
                  {/* Theme Toggle inside menu for mobile users */}
                  <div className="sm:hidden">
                    <button 
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors w-full text-left"
                    >
                      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} Toggle Theme
                    </button>
                  </div>
                  
                  <div className="h-px bg-slate-100 dark:bg-white/5 my-2"></div>
                  
                  <button className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <div className="flex-1 overflow-auto px-6 md:px-10 pt-28 pb-28 md:pb-10">
          {children}
        </div>
      </main>

      {/* MOBILE FLOATING IOS-STYLE DOCK */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
        <nav className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-white/10 shadow-2xl rounded-full flex items-center justify-between px-2 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/") && item.href !== "/dashboard";
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  isActive 
                    ? "bg-[var(--color-brand-deep)] text-white shadow-md shadow-[var(--color-brand-deep)]/30 scale-105" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}
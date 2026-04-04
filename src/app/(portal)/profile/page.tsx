"use client";

import { useState } from "react";
import { 
  User, Shield, Bell, Settings, Camera, Mail, 
  Smartphone, Lock, LogOut, Laptop, CheckCircle2, AlertTriangle 
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "preferences">("personal");

  // Mock State for Toggles
  const [toggles, setToggles] = useState({
    twoFactor: true,
    emailAlerts: true,
    marketing: false,
    pushNotifications: true
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Custom Toggle Component for reuse
  const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 ${checked ? 'bg-[var(--color-brand-deep)]' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? 'translate-x-5.5 left-0.5' : 'translate-x-0 left-0.5'}`} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profile & Settings</h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account details and security preferences.</p>
      </div>

      {/* INNER TABS */}
      <div className="flex overflow-x-auto hide-scrollbar bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-xl w-max shadow-inner border border-black/5 dark:border-white/5">
        {[
          { id: "personal", label: "Personal Info", icon: User },
          { id: "security", label: "Security & Access", icon: Shield },
          { id: "preferences", label: "Preferences", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
        
        {/* ========================================= */}
        {/* PERSONAL INFO TAB                         */}
        {/* ========================================= */}
        {activeTab === "personal" && (
          <div className="animate-in fade-in space-y-8">
            
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-slate-100 dark:border-white/5">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--color-brand-deep)] to-[var(--color-brand-light)] p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-3xl font-bold text-[var(--color-brand-deep)]">
                    KA
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full text-slate-600 dark:text-slate-300 hover:text-[var(--color-brand-deep)] shadow-sm transition-colors group-hover:scale-105">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Picture</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Upload a high-resolution image to personalize your KORE dashboard. PNG or JPG under 5MB.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" defaultValue="Korede" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" defaultValue="Ajayi" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" defaultValue="korede@korefinance.com" disabled className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">Contact support to change your email address.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" defaultValue="+234 800 000 0000" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
              <button className="bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* SECURITY TAB                              */}
        {/* ========================================= */}
        {activeTab === "security" && (
          <div className="animate-in fade-in space-y-8">
            
            {/* 2FA Toggle */}
            <div className="flex items-center justify-between p-5 bg-[var(--color-brand-deep)]/5 border border-[var(--color-brand-deep)]/20 rounded-2xl">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md">Secure your account with an extra layer of security using an authenticator app or email alerts.</p>
                </div>
              </div>
              <Switch checked={toggles.twoFactor} onChange={() => handleToggle('twoFactor')} />
            </div>

            {/* Change Password */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Change Password</h3>
              <div className="grid grid-cols-1 gap-4 max-w-lg">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="Current Password" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="New Password" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="Confirm New Password" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" />
                </div>
                <button className="w-max bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-6 py-3 rounded-xl text-sm font-bold transition-colors mt-2">
                  Update Password
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

            {/* Active Sessions */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-4">
                    <Laptop className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">Windows PC - Chrome <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lagos, Nigeria • Current Session</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-transparent">
                  <div className="flex items-center gap-4">
                    <Smartphone className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">iPhone 14 Pro - Safari</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">London, UK • Last active: 2 days ago</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-rose-500 hover:underline">Revoke</button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================= */}
        {/* PREFERENCES TAB                           */}
        {/* ========================================= */}
        {activeTab === "preferences" && (
          <div className="animate-in fade-in space-y-8">
            
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Display Currency</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xl">This is your base currency. All overall net worth calculations and generic dashboard metrics will be converted to this currency.</p>
              
              <div className="max-w-xs">
                <select className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none">
                  <option value="NGN">₦ Nigerian Naira (NGN)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Notifications</h3>
              <div className="space-y-4 max-w-2xl">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive alerts on your mobile device.</p>
                  </div>
                  <Switch checked={toggles.pushNotifications} onChange={() => handleToggle('pushNotifications')} />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Alerts & Summaries</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Get weekly financial summaries and critical security alerts.</p>
                  </div>
                  <Switch checked={toggles.emailAlerts} onChange={() => handleToggle('emailAlerts')} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Marketing & Offers</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive news about new KORE features and partner offers.</p>
                  </div>
                  <Switch checked={toggles.marketing} onChange={() => handleToggle('marketing')} />
                </div>

              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

            {/* Danger Zone */}
            <div>
              <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Danger Zone</h3>
              <div className="p-5 border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Account</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md">Permanently delete your data and all connected financial records. This action cannot be undone.</p>
                </div>
                <button className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shrink-0">
                  Delete Account
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
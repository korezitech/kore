"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  User, Shield, Bell, Settings, Camera, Mail, 
  Smartphone, Lock, AlertTriangle, CheckCircle2, Loader2, Eye, EyeOff 
} from "lucide-react";

import { getProfile, updateProfile, updatePassword, deleteAccount, sendWeeklySummary } from "@/actions/profileActions";

type ConfirmConfig = {
  title: string;
  message: string;
  actionText: string;
  actionColor: string;
  iconColor: string;
  onConfirm: () => Promise<void> | void;
  isAlertOnly?: boolean;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;
  const userEmail = (session?.user as any)?.email;

  const [activeTab, setActiveTab] = useState<"personal" | "security" | "preferences">("personal");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // State
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    baseCurrency: "NGN"
  });

  const [toggles, setToggles] = useState({
    twoFactorEnabled: false,
    emailAlerts: true,
    pushNotifications: true,
    marketingAlerts: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [userId, status]);

  const fetchUserData = async () => {
    setIsLoading(true);
    const data = await getProfile(userId);
    if (data) {
      setProfileData({
        name: data.name || "",
        phone: data.phone || "",
        baseCurrency: data.baseCurrency || "NGN"
      });
      setToggles({
        twoFactorEnabled: data.twoFactorEnabled || false,
        emailAlerts: data.emailAlerts || false,
        pushNotifications: data.pushNotifications || false,
        marketingAlerts: data.marketingAlerts || false
      });
    }
    setIsLoading(false);
  };

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handle2FAToggle = async () => {
    const newValue = !toggles.twoFactorEnabled;
    setToggles(prev => ({ ...prev, twoFactorEnabled: newValue }));

    const result = await updateProfile({
      userId,
      ...profileData,
      ...toggles,
      twoFactorEnabled: newValue 
    });

    if (!result.success) {
      setToggles(prev => ({ ...prev, twoFactorEnabled: !newValue }));
      showAlert("Error", "Failed to update 2FA settings. Please check your connection.");
    }
  };

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

  const handleSaveProfile = async () => {
    if (!profileData.name) return showAlert("Missing Information", "Full name is required.");
    
    setIsSubmitting(true);
    const result = await updateProfile({
      userId,
      ...profileData,
      ...toggles
    });

    if (result.success) {
      showAlert("Success", "Your profile preferences have been updated.", "success");
    } else {
      showAlert("Error", result.error || "Failed to update profile.");
    }
    setIsSubmitting(false);
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      return showAlert("Missing Information", "Please fill in all password fields.");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showAlert("Mismatch", "New passwords do not match.");
    }

    setIsSubmitting(true);
    const result = await updatePassword({
      userId,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    if (result.success) {
      showAlert("Success", "Password securely updated.", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ current: false, new: false, confirm: false });
    } else {
      showAlert("Action Failed", result.error || "Incorrect current password.");
    }
    setIsSubmitting(false);
  };

  const handleSendTestEmail = async () => {
    setIsSendingEmail(true);
    const result = await sendWeeklySummary(userId);
    if (result.success) {
      showAlert("Email Sent", "Your weekly summary is on its way to your inbox!", "success");
    } else {
      showAlert("Error", result.error || "Failed to send email.");
    }
    setIsSendingEmail(false);
  };

  const handleDeleteAccount = () => {
    setConfirmConfig({
      title: "Delete Account",
      message: "Are you absolutely sure? This will permanently wipe your user data, investments, accounts, and transactions. This cannot be undone.",
      actionText: "Yes, Delete Everything",
      actionColor: "bg-rose-600 hover:bg-rose-700",
      iconColor: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      isAlertOnly: false,
      onConfirm: async () => {
        const result = await deleteAccount(userId);
        if (result.success) {
          signOut({ callbackUrl: '/login' });
        } else {
          showAlert("Error", "Could not delete account. Please contact support.");
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 ${checked ? 'bg-[var(--color-brand-deep)]' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${checked ? 'translate-x-5.5 left-0.5' : 'translate-x-0 left-0.5'}`} />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-brand-deep)]" />
        <p className="text-sm font-semibold">Loading profile data...</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "KA";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-24">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profile & Settings</h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account details and security preferences.</p>
      </div>

      {/* INNER TABS - Fixed mobile overflow issue */}
      <div className="flex overflow-x-auto hide-scrollbar bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-xl w-full md:w-max shadow-inner border border-black/5 dark:border-white/5">
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
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-slate-100 dark:border-white/5">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--color-brand-deep)] to-[var(--color-brand-light)] p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-3xl font-bold text-[var(--color-brand-deep)] tracking-widest">
                    {getInitials(profileData.name)}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full text-slate-400 cursor-not-allowed">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Picture</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Custom avatar uploads are currently disabled for security. Your initials will be displayed across the app.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Full Name</label>
                <div className="relative max-w-xl">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="e.g. Korede Ajayi" 
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={userEmail || ""} 
                    disabled 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">Contact support to change your registered email address.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+234 800 000 0000" 
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={handleSaveProfile}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 disabled:opacity-70"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
              <Switch checked={toggles.twoFactorEnabled} onChange={handle2FAToggle} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Change Password</h3>
              <div className="grid grid-cols-1 gap-4 max-w-lg">
                
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPasswords.current ? "text" : "password"} 
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="Current Password" 
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                  />
                  <button 
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPasswords.new ? "text" : "password"} 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="New Password" 
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                  />
                  <button 
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPasswords.confirm ? "text" : "password"} 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    placeholder="Confirm New Password" 
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                  />
                  <button 
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button 
                  onClick={handleUpdatePassword}
                  disabled={isSubmitting}
                  className="w-max flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-6 py-3 rounded-xl text-sm font-bold transition-colors mt-2 disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
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
                <select 
                  value={profileData.baseCurrency}
                  onChange={(e) => setProfileData({...profileData, baseCurrency: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 appearance-none"
                >
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
                
                <div className="flex flex-col p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Alerts & Summaries</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Get weekly financial summaries and critical security alerts.</p>
                    </div>
                    <Switch checked={toggles.emailAlerts} onChange={() => handleToggle('emailAlerts')} />
                  </div>
                  
                  {toggles.emailAlerts && (
                    <div className="pt-3 border-t border-slate-200 dark:border-white/10">
                      <button 
                        onClick={handleSendTestEmail}
                        disabled={isSendingEmail}
                        className="flex items-center gap-2 text-sm font-bold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-light)] transition-colors disabled:opacity-50"
                      >
                        {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        {isSendingEmail ? "Generating Summary..." : "Send Summary Now"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Marketing & Offers</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive news about new KORE features and partner offers.</p>
                  </div>
                  <Switch checked={toggles.marketingAlerts} onChange={() => handleToggle('marketingAlerts')} />
                </div>

              </div>
            </div>

            <div className="flex justify-start pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={handleSaveProfile}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-70"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Preferences
              </button>
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
                <button 
                  onClick={handleDeleteAccount}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shrink-0"
                >
                  Delete Account
                </button>
              </div>
            </div>

          </div>
        )}

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
    </div>
  );
}
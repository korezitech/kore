"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Mail, Lock, Key, User, ArrowRight, ShieldCheck, 
  ChevronLeft, Loader2, CheckCircle2, Eye, EyeOff, RefreshCw, AlertCircle
} from "lucide-react";
import { redeemInviteToken, resend2FACode, requestPasswordReset, resetPassword } from "@/actions/authActions";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "redeem" | "success" | "2fa" | "forgot" | "reset">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  
  // New States for Password Reset
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Frontend Cooldown Timer
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); 
    setSuccessMessage("");

    if (view === "redeem") {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("name", fullName);
      formData.append("email", email);

      const result = await redeemInviteToken(formData);
      setIsLoading(false);

      if (result.error) {
        setErrorMessage(result.error);
      } else if (result.success) {
        setView("success");
      }
    } 
    else if (view === "forgot") {
      const result = await requestPasswordReset(email);
      setIsLoading(false);
      
      if (result.success) {
        setView("reset");
        setSuccessMessage("A 6-digit reset code has been sent to your email.");
      } else {
        setErrorMessage(result.error || "Failed to request reset.");
      }
    }
    else if (view === "reset") {
      const result = await resetPassword(email, resetCode, newPassword);
      setIsLoading(false);

      if (result.success) {
        setView("login");
        setSuccessMessage("Password reset successfully! You can now log in.");
        setResetCode("");
        setNewPassword("");
        setPassword("");
      } else {
        setErrorMessage(result.error || "Failed to reset password.");
      }
    }
    else if (view === "2fa") {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
        twoFactorCode: twoFactorCode, 
      });

      setIsLoading(false);

      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        window.location.href = "/dashboard";
      }
    } 
    else {
      // Standard Login Flow
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });

      setIsLoading(false);

      if (result?.error) {
        if (result.error === "2FA_REQUIRED") {
          setView("2fa");
          setErrorMessage(""); 
          setResendCooldown(60);
        } else {
          setErrorMessage(result.error);
        }
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    const result = await resend2FACode(email);
    
    setIsResending(false);
    if (result.success) {
      setSuccessMessage("A new code has been sent to your email.");
      setResendCooldown(60); 
    } else {
      setErrorMessage(result.error || "Failed to resend code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19] relative overflow-hidden selection:bg-[var(--color-brand-deep)] selection:text-white">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand-deep)]/10 dark:bg-[var(--color-brand-deep)]/20 blur-[100px] rounded-full pointer-events-none"></div>

      <Link href="/" className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-20">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>

      <div className="glass-panel w-full max-w-md p-8 md:p-10 relative z-10 flex flex-col shadow-2xl">
        
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-10">
            <Image src="/kore-coloured.png" alt="KORE Logo" fill className="block dark:hidden object-contain" />
            <Image src="/kore-white.png" alt="KORE Logo" fill className="hidden dark:block object-contain" />
          </div>
        </div>

        {view !== "success" ? (
          <>
            {/* ONLY SHOW LOGIN/REDEEM TABS IF NOT IN 2FA OR RECOVERY MODES */}
            {(view === "login" || view === "redeem") && (
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-8 border border-slate-200 dark:border-white/5">
                <button 
                  type="button"
                  onClick={() => { setView('login'); setErrorMessage(''); setSuccessMessage(''); }} 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    view === 'login' 
                      ? 'bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Log In
                </button>
                <button 
                  type="button"
                  onClick={() => { setView('redeem'); setErrorMessage(''); setSuccessMessage(''); }} 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    view === 'redeem' 
                      ? 'bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Redeem Token
                </button>
              </div>
            )}

            <form onSubmit={handleAction} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* REDEEM TOKEN VIEW */}
              {view === 'redeem' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Access Token</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="token"
                        required
                        placeholder="KORE-XXXXXXXX"
                        value={token}
                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 font-mono font-bold uppercase placeholder:font-sans placeholder:font-normal" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="name"
                        required
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SHARED EMAIL INPUT FOR LOGIN, REDEEM, AND FORGOT PASSWORD */}
              {(view === "login" || view === "redeem" || view === "forgot") && (
                <>
                  {view === "forgot" && (
                    <div className="text-center mb-6 animate-in zoom-in-95">
                      <div className="w-16 h-16 rounded-full bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        Enter your registered email address and we'll send you a secure 6-digit recovery code.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        name="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50" 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* LOGIN ONLY - PASSWORD INPUT */}
              {view === 'login' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <button 
                      type="button" 
                      onClick={() => { setView('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
                      className="text-xs font-bold text-[var(--color-brand-deep)] hover:underline focus:outline-none"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* 2FA VIEW */}
              {view === "2fa" && (
                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Two-Factor Auth</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Please enter the 6-digit security code sent to your registered email address.
                    </p>
                  </div>

                  <div>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="000000"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 font-mono tracking-[0.5em] text-center text-xl font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RESET PASSWORD VIEW */}
              {view === "reset" && (
                <div className="space-y-5 animate-in zoom-in-95 duration-300">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Password</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Enter the 6-digit code sent to your email and your new secure password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Reset Code</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="000000"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 font-mono tracking-[0.25em] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-12 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-brand-deep)] transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Messaging */}
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-500 dark:text-red-400 text-center font-medium">{errorMessage}</p>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center font-medium">{successMessage}</p>
                </div>
              )}

              {/* SUBMIT BUTTONS */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[var(--color-brand-deep)]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {view === 'login' ? 'Authenticate Session' : 
                       view === 'redeem' ? 'Request Activation' : 
                       view === 'forgot' ? 'Request Reset Link' :
                       view === 'reset' ? 'Update Password' :
                       'Verify Code'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* EXTRA BUTTONS FOR 2FA & RECOVERY */}
                {(view === '2fa' || view === 'forgot' || view === 'reset') && (
                  <div className="flex flex-col gap-2 mt-4">
                    
                    {view === '2fa' && (
                      <button
                        type="button"
                        disabled={isResending || resendCooldown > 0}
                        onClick={handleResendCode}
                        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                      </button>
                    )}
                    
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => { 
                        setView("login"); 
                        setTwoFactorCode(""); 
                        setResetCode("");
                        setNewPassword("");
                        setErrorMessage(""); 
                        setSuccessMessage(""); 
                      }}
                      className="w-full flex items-center justify-center text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors py-2"
                    >
                      Cancel & Return to Login
                    </button>
                  </div>
                )}
              </div>

            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This is a restricted financial environment. All activities are monitored and protected by bank-grade AES-256 encryption.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-6 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Token Received</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Your registration request is now pending administrator approval. You will receive an email with your secure login credentials once your account is activated.
            </p>
            <button 
              type="button"
              onClick={() => {
                setView('login');
                setToken('');
                setFullName('');
                setEmail('');
              }}
              className="w-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white py-3.5 rounded-xl text-sm font-bold transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
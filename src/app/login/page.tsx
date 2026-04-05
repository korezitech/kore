"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Mail, Lock, Key, User, ArrowRight, ShieldCheck, 
  ChevronLeft, Loader2, CheckCircle2, Eye, EyeOff 
} from "lucide-react";
import { redeemInviteToken } from "@/actions/authActions";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "redeem" | "success">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Clear old errors

    if (view === "redeem") {
      // Pack the React state into FormData for the Server Action
      const formData = new FormData();
      formData.append("token", token);
      formData.append("name", fullName);
      formData.append("email", email);

      // Call your Node.js API via the Next.js Server Action
      const result = await redeemInviteToken(formData);

      setIsLoading(false);

      // Handle the response
      if (result.error) {
        setErrorMessage(result.error);
      } else if (result.success) {
        setView("success");
      }
    } else {
      // Login flow (We will wire this up to NextAuth later)
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = "/dashboard";
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19] relative overflow-hidden selection:bg-[var(--color-brand-deep)] selection:text-white">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand-deep)]/10 dark:bg-[var(--color-brand-deep)]/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Back to Home Navigation */}
      <Link href="/" className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-20">
        <ChevronLeft className="w-4 h-4" /> Home
      </Link>

      {/* Main Authentication Card */}
      <div className="glass-panel w-full max-w-md p-8 md:p-10 relative z-10 flex flex-col shadow-2xl">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-10">
            <Image src="/kore-coloured.png" alt="KORE Logo" fill className="block dark:hidden object-contain" />
            <Image src="/kore-white.png" alt="KORE Logo" fill className="hidden dark:block object-contain" />
          </div>
        </div>

        {view !== "success" ? (
          <>
            {/* View Toggle */}
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-8 border border-slate-200 dark:border-white/5">
              <button 
                type="button"
                onClick={() => { setView('login'); setErrorMessage(''); }} 
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
                onClick={() => { setView('redeem'); setErrorMessage(''); }} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  view === 'redeem' 
                    ? 'bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'
                }`}
              >
                Redeem Token
              </button>
            </div>

            {/* Forms */}
            <form onSubmit={handleAction} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
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

              {view === 'login' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <button type="button" className="text-xs font-bold text-[var(--color-brand-deep)] hover:underline">Forgot?</button>
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
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Error Message Display */}
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-500 dark:text-red-400 text-center font-medium">{errorMessage}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[var(--color-brand-deep)]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {view === 'login' ? 'Authenticate Session' : 'Request Activation'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This is a restricted financial environment. All activities are monitored and protected by bank-grade AES-256 encryption.
              </p>
            </div>
          </>
        ) : (
          /* Success State for Token Redemption */
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
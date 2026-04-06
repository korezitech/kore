"use client";

import { useState, useEffect } from "react";
import { 
  Users, Activity, ShieldCheck, ArrowUpRight, Search, 
  Filter, Download, AlertCircle, Database, 
  Server, Key, Copy, MessageCircle, UserCheck, UserX, Trash2, X, Loader2, CheckCircle2, Mail 
} from "lucide-react";
import { 
  getPendingUsers, 
  generateNewToken, 
  activatePendingUser, 
  sendTokenEmail, 
  deactivateUser, 
  deleteUser 
} from "@/actions/adminActions";

export default function AdminPanelPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "system" | "audit">("users");
  
  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<"All" | "active" | "pending" | "inactive">("All");

  // Real Database State
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Token Drawer State
  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("Generating...");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Manage User Drawer State
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [manageView, setManageView] = useState<"actions" | "edit">("actions");
  
  // Action States
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Load real users on page load
  useEffect(() => {
    async function loadUsers() {
      setIsLoadingUsers(true);
      const users = await getPendingUsers();
      setRealUsers(users || []);
      setIsLoadingUsers(false);
    }
    loadUsers();
  }, []);

  const pendingCount = realUsers.filter(u => u.status === 'pending').length;

  const platformStats = [
    { id: 1, label: "Total Users", value: realUsers.length.toString(), change: "Live Sync", isPositive: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: 2, label: "Pending Activations", value: pendingCount.toString(), change: pendingCount > 0 ? "Action Needed" : "All Clear", isPositive: pendingCount === 0, icon: UserCheck, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: 3, label: "Platform Volume (30d)", value: "₦0.00", change: "New Instance", isPositive: true, icon: Activity, color: "text-[var(--color-brand-deep)]", bg: "bg-[var(--color-brand-deep)]/10" },
    { id: 4, label: "System Alerts", value: "0", change: "Secure", isPositive: true, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  // Filter Logic (Search + Status)
  const filteredUsers = realUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export Handler
  const handleExport = () => {
    if (filteredUsers.length === 0) return alert("No users to export.");
    const headers = ["ID,Name,Email,Status,Date Joined"];
    const rows = filteredUsers.map(u => `${u.id},${u.name},${u.email},${u.status || 'pending'},${new Date(u.createdAt).toLocaleDateString()}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kore_users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Token Handlers
  const handleGenerateToken = async () => {
    setIsGenerating(true);
    setGeneratedToken("Generating...");
    setInviteEmail(""); 
    try {
      const token = await generateNewToken();
      if (token) {
        setGeneratedToken(token);
      } else {
        setGeneratedToken("Error generating token");
      }
    } catch (error) {
      setGeneratedToken("Network Fetch Error");
    }
    setIsGenerating(false);
  };

  const openTokenDrawer = () => {
    handleGenerateToken();
    setIsTokenDrawerOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const shareToWhatsApp = () => {
    const text = `Here is your exclusive invite token for KORE Financial: ${generatedToken}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToEmail = async () => {
    if (!inviteEmail || !generatedToken || generatedToken.includes('Error')) return;
    
    setIsSendingEmail(true);
    setEmailSuccess(false);
    
    const result = await sendTokenEmail(inviteEmail, generatedToken);
    
    setIsSendingEmail(false);
    
    if (result.success) {
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000); 
    } else {
      alert("Failed to send email: " + result.error);
    }
  };

  // User Management Handlers
  const openManageUser = (user: any) => {
    setSelectedUser(user);
    setManageView("actions");
    setNewPassword(""); 
    setIsUserDrawerOpen(true);
  };

  const handleActivateUser = async () => {
    if (!selectedUser) return;
    setIsActivating(true);
    
    const result = await activatePendingUser(selectedUser.id);
    
    if (result.status === "Success") {
      setNewPassword(result.temporaryPassword);
      setRealUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: 'active' } : u));
    } else {
      alert("Error activating user: " + result.error);
    }
    setIsActivating(false);
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser || !confirm(`Are you sure you want to suspend ${selectedUser.name}? They will be locked out immediately.`)) return;
    setIsDeactivating(true);
    
    const result = await deactivateUser(selectedUser.id);
    
    if (result.success) {
      setRealUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: 'inactive' } : u));
      setSelectedUser({...selectedUser, status: 'inactive'});
    } else {
      alert("Error suspending user: " + result.error);
    }
    setIsDeactivating(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !confirm(`DANGER: Are you sure you want to permanently delete ${selectedUser.name}? This cannot be undone.`)) return;
    setIsDeleting(true);
    
    const result = await deleteUser(selectedUser.id);
    
    if (result.success) {
      setRealUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setIsUserDrawerOpen(false); 
    } else {
      alert("Error deleting user: " + result.error);
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[80vh]">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Administration</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage users, access tokens, and monitor system health.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="hidden md:flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={openTokenDrawer}
            className="flex items-center justify-center gap-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[var(--color-brand-deep)]/20 w-full md:w-auto"
          >
            <Key className="w-4 h-4" /> Generate Token
          </button>
        </div>
      </div>

      {/* TOP ROW: Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {platformStats.map((stat) => (
          <div key={stat.id} className="glass-panel p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${stat.isPositive ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="glass-panel overflow-hidden flex flex-col">
        <div className="flex overflow-x-auto hide-scrollbar bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 p-2 gap-2">
          {[
            { id: "users", label: "User Directory", icon: Users },
            { id: "system", label: "System Health", icon: Server },
            { id: "audit", label: "Audit Logs", icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-white dark:bg-slate-800 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)] shadow-sm border border-slate-200 dark:border-white/5" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div className="p-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search users by name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50 transition-all"
                />
              </div>
              
              {/* STATUS FILTER DROPDOWN */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Filter className="w-4 h-4" />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active Users</option>
                  <option value="pending">Pending Activations</option>
                  <option value="inactive">Suspended Users</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-black/20 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5">
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold hidden lg:table-cell">Joined</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading user directory...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 uppercase">
                              {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {/* DYNAMIC STATUS BADGE */}
                          {user.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                              Active
                            </span>
                          ) : user.status === 'inactive' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20">
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300 hidden lg:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => openManageUser(user)}
                            className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab !== "users" && (
          <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
            <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{activeTab === 'system' ? 'System Health Monitoring' : 'Security Audit Logs'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">This module will be activated during the next backend integration phase.</p>
          </div>
        )}
      </div>

      {/* DRAWER: GENERATE TOKEN */}
      {isTokenDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsTokenDrawerOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isTokenDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Token</h3>
            <p className="text-xs text-slate-500">Generate and share a secure access key.</p>
          </div>
          <button onClick={() => setIsTokenDrawerOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-brand-deep)]/10 text-[var(--color-brand-deep)] flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Access Token</h4>
            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl flex justify-center items-center min-h-[4rem]">
              {isGenerating ? (
                <Loader2 className="w-6 h-6 animate-spin text-[var(--color-brand-deep)]" />
              ) : (
                <p className={`text-xl font-mono font-bold tracking-widest ${generatedToken.includes('Error') ? 'text-rose-500 text-sm break-words' : 'text-slate-900 dark:text-white'}`}>
                  {generatedToken}
                </p>
              )}
            </div>
            <button onClick={handleGenerateToken} disabled={isGenerating} className="text-xs font-bold text-[var(--color-brand-deep)] mt-3 hover:underline disabled:opacity-50">
              Generate New Token
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Share Token</h4>
            
            <div className="flex gap-2">
              <button onClick={() => copyToClipboard(generatedToken)} disabled={isGenerating || generatedToken.includes('Error')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                <Copy className="w-4 h-4" /> Copy
              </button>
              
              <button onClick={shareToWhatsApp} disabled={isGenerating || generatedToken.includes('Error')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </button>
            </div>

            {/* EMAIL SHARE UI */}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Send via Email</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="investor@example.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-deep)]/50"
                />
                <button 
                  onClick={shareToEmail}
                  disabled={isGenerating || generatedToken.includes('Error') || !inviteEmail || isSendingEmail} 
                  className={`px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 ${
                    emailSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)]'
                  }`}
                >
                  {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* DRAWER: MANAGE USER */}
      {isUserDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsUserDrawerOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white dark:bg-[#0B0F19] border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isUserDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage User</h3>
          <button onClick={() => setIsUserDrawerOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedUser && (
          <div className="flex-1 overflow-y-auto p-6">
            
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-white/5 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xl font-bold text-slate-600 dark:text-slate-300 shrink-0 uppercase">
                {selectedUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{selectedUser.name}</h4>
                <p className="text-sm text-slate-500 truncate">{selectedUser.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md border bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 truncate max-w-full">
                  ID: {selectedUser.id.split('-')[0]}...
                </div>
              </div>
            </div>

            {manageView === "actions" ? (
              <div className="space-y-4 animate-in slide-in-from-left-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Account Actions</h4>
                
                {selectedUser.status === 'inactive' ? (
                   <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                      <h5 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-1">Account Suspended</h5>
                      <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mb-3">This user is currently locked out of the platform.</p>
                      <button 
                        className="w-full py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-700 dark:text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        Restore Access
                      </button>
                   </div>
                ) : selectedUser.status === 'active' ? (
                   <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">This account is active and verified.</p>
                      
                      {/* SUSPEND BUTTON */}
                      <button 
                        onClick={handleDeactivateUser}
                        disabled={isDeactivating}
                        className="w-full py-2.5 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isDeactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                        {isDeactivating ? "Suspending..." : "Suspend Account"}
                      </button>
                   </div>
                ) : !newPassword ? (
                  <div className="p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl">
                    <h5 className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-1">Activation Required</h5>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mb-3">This user has registered using a token but awaits your approval to receive login credentials.</p>
                    <button 
                      onClick={handleActivateUser}
                      disabled={isActivating}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      {isActivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} 
                      {isActivating ? "Activating Database..." : "Activate & Generate Password"}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <h5 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1">Account Activated!</h5>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mb-3">Send this temporary password to the user securely:</p>
                    <div className="bg-white dark:bg-black/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20 mb-3">
                      <p className="text-xl font-mono font-bold text-slate-900 dark:text-white tracking-widest">{newPassword}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(newPassword)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" /> Copy Password
                    </button>
                  </div>
                )}

                {/* DELETE BUTTON */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
                  <button 
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="w-full py-3 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} 
                    {isDeleting ? "Deleting..." : "Reject & Delete User"}
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        )}
      </div>

    </div>
  );
}
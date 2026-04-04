"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Bot, Send, Paperclip, Mic, Sparkles, TrendingUp, 
  ShieldCheck, User, Loader2
} from "lucide-react";

// Initial mock conversation to show off the UI
const initialMessages = [
  {
    id: 1,
    role: "ai",
    content: "Welcome back! I'm KORE Brain, your personal financial architect. I have live access to your ₦89.1M in liabilities, your $44k portfolio, and your upcoming milestones. How can we optimize your wealth today?",
    timestamp: "10:00 AM"
  },
  {
    id: 2,
    role: "user",
    content: "If I add an extra ₦50,000 to my Home Mortgage payment every month, how much faster will I pay it off?",
    timestamp: "10:02 AM"
  },
  {
    id: 3,
    role: "ai",
    content: "Great question. Your current mortgage balance is ₦38,500,000 at 8.5% APR with a ₦350,000/mo payment.\n\nIf you increase your payment to **₦400,000/mo**:\n• You will be debt-free **3 years and 4 months earlier**.\n• You will save approximately **₦4,250,000 in total interest**.\n\nWould you like me to update your automated monthly allocation to reflect this new ₦400,000 target?",
    timestamp: "10:02 AM"
  }
];

const quickPrompts = [
  { icon: TrendingUp, text: "Analyze my portfolio risk" },
  { icon: ShieldCheck, text: "How can I lower my debt?" },
  { icon: Sparkles, text: "Find unneeded subscriptions" }
];

export default function AIBrainPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      const newAIMsg = {
        id: Date.now() + 1,
        role: "ai",
        content: "I've analyzed that request against your current connected accounts. Based on your Cash Flow, this is a highly feasible move. Should I draft a detailed budget breakdown for you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newAIMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputValue(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-deep)]/10 flex items-center justify-center text-[var(--color-brand-deep)] dark:text-[var(--color-brand-light)]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              KORE Brain <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>Online</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Powered by advanced financial models.</p>
          </div>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          Clear Context
        </button>
      </div>

      {/* CHAT INTERFACE */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative border-t-4 border-t-[var(--color-brand-deep)]">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                  msg.role === 'ai' 
                    ? 'bg-gradient-to-br from-[var(--color-brand-deep)] to-[var(--color-brand-light)] text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                }`}>
                  {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col gap-1">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-sm' 
                      : 'bg-white dark:bg-[#161B22] border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                  }`}>
                    {/* FIXED: dangerouslySetInnerHTML is properly capitalized */}
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.includes('**') ? (
                          <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        ) : line}
                        {i !== msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <span className={`text-[10px] text-slate-400 font-medium ${msg.role === 'user' ? 'text-right pr-1' : 'text-left pl-1'}`}>
                    {msg.timestamp}
                  </span>
                </div>

              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
             <div className="flex justify-start">
               <div className="flex gap-3 max-w-[85%]">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-brand-deep)] to-[var(--color-brand-light)] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-white/5 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[52px]">
                    <div className="w-2 h-2 bg-[var(--color-brand-deep)]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--color-brand-deep)]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--color-brand-deep)]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT DOCK */}
        <div className="p-4 bg-slate-50/80 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 backdrop-blur-md">
          
          {/* Quick Prompts */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-3 pb-1">
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="flex items-center gap-1.5 whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-[var(--color-brand-deep)]/50 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <prompt.icon className="w-3 h-3 text-[var(--color-brand-deep)]" />
                {prompt.text}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-brand-deep)]/50 transition-all">
            <button type="button" className="p-2 text-slate-400 hover:text-[var(--color-brand-deep)] hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask KORE Brain anything..."
              className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 py-2.5 px-1 outline-none"
              rows={1}
            />

            {inputValue.trim() ? (
              <button 
                type="submit" 
                disabled={isTyping}
                className="p-2.5 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-light)] text-white rounded-xl transition-colors shadow-md disabled:opacity-50 shrink-0"
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            ) : (
              <button type="button" className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition-colors shrink-0">
                <Mic className="w-5 h-5" />
              </button>
            )}
          </form>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">KORE AI can make mistakes. Consider verifying critical financial information.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
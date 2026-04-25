"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Bot, Send, Paperclip, Mic, Sparkles, TrendingUp, 
  ShieldCheck, User, Loader2, Zap, BrainCircuit, ChevronDown
} from "lucide-react";
import { chatWithKoreBrain } from "@/actions/aiActions";

const quickPrompts = [
  { icon: TrendingUp, text: "Analyze my portfolio risk" },
  { icon: ShieldCheck, text: "How can I lower my debt?" },
  { icon: Sparkles, text: "Find unneeded subscriptions" }
];

export default function AIBrainPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      content: "Welcome to KORE Brain. I am securely connected to your ledger. How can we optimize your wealth today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Model Toggle State
  const [selectedModel, setSelectedModel] = useState<"gemini-2.5-flash" | "gemini-2.5-pro">("gemini-2.5-flash");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, promptOverride?: string) => {
    e?.preventDefault();
    const textToSend = promptOverride || inputValue;
    if (!textToSend.trim() || !userId) return;

    // Add user message to UI
    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // We need to pass the conversation history excluding the welcome message if we want, 
    // but sending the whole history is fine.
    const updatedHistory = [...messages, newUserMsg];
    
    setMessages(updatedHistory);
    setInputValue("");
    setIsTyping(true);

    // Call the real backend API
    // We strip out the UI-specific properties (like id, timestamp) to send pure history
    const apiHistory = updatedHistory.slice(1).map(m => ({ role: m.role, content: m.content }));
    
    const result = await chatWithKoreBrain(userId, apiHistory, selectedModel);

    // Add AI response to UI
    const newAIMsg = {
      id: Date.now() + 1,
      role: "ai",
      content: (result as any).text || "Error: Could not reach KORE Brain.", // <-- Changed this line
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newAIMsg]);
    setIsTyping(false);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: "ai",
      content: "Context cleared. Let's start fresh. What's on your mind?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 shrink-0 gap-4">
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
        
        <div className="flex items-center gap-2 relative">
          {/* MODEL TOGGLE */}
          <div className="relative">
            <button 
               onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
               className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
               {selectedModel === "gemini-2.5-flash" ? <Zap className="w-4 h-4 text-amber-500" /> : <BrainCircuit className="w-4 h-4 text-purple-500" />}
               <span className="hidden md:inline">{selectedModel === "gemini-2.5-flash" ? "Flash (Fast)" : "Pro (Deep Reasoning)"}</span>
               <ChevronDown className="w-4 h-4 opacity-50" />
            </button>

            {modelDropdownOpen && (
               <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button 
                     onClick={() => { setSelectedModel("gemini-2.5-flash"); setModelDropdownOpen(false); }} 
                     className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                  >
                     <Zap className={`w-4 h-4 ${selectedModel === 'gemini-2.5-flash' ? 'text-amber-500' : 'text-slate-400'}`} />
                     <div>
                       <div>Gemini Flash</div>
                       <div className="text-[10px] text-slate-500 font-normal">Fastest • Good for quick queries</div>
                     </div>
                  </button>
                  <button 
                     onClick={() => { setSelectedModel("gemini-2.5-pro"); setModelDropdownOpen(false); }}
                     className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300"
                  >
                     <BrainCircuit className={`w-4 h-4 ${selectedModel === 'gemini-2.5-pro' ? 'text-purple-500' : 'text-slate-400'}`} />
                     <div>
                       <div>Gemini Pro</div>
                       <div className="text-[10px] text-slate-500 font-normal">Slower • Complex financial planning</div>
                     </div>
                  </button>
               </div>
            )}
          </div>

          <button onClick={clearChat} className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            Clear Context
          </button>
        </div>
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
                    {/* Render basic bolding and line breaks */}
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
                onClick={(e) => handleSend(e, prompt.text)}
                disabled={isTyping}
                className="flex items-center gap-1.5 whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-[var(--color-brand-deep)]/50 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
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
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Bot, Send, Paperclip, Mic, Sparkles, TrendingUp, 
  ShieldCheck, User, Loader2, Zap, BrainCircuit, ChevronDown, CheckCircle2
} from "lucide-react";
import { 
  chatWithKoreBrain, 
  getChatHistory, 
  saveChatMessage, 
  updateChatToolStatus, 
  clearChatHistory 
} from "@/actions/aiActions";
import { createTransaction } from "@/actions/transactionActions";

// --- TYPEWRITER EFFECT COMPONENT ---
const TypewriterEffect = ({ content, onType }: { content: string, onType: () => void }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed(""); // Reset displayed text when content changes
    const timer = setInterval(() => {
      setDisplayed(content.substring(0, i + 1));
      i++;
      onType(); // Auto-scroll as it types
      if (i >= content.length) clearInterval(timer);
    }, 15); // 15ms per character for a fast, snappy typing feel
    
    return () => clearInterval(timer);
  }, [content, onType]);

  return (
    <>
      {displayed.split('\n').map((line, i) => (
        <span key={i}>
          {line.includes('**') ? (
            <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          ) : line}
          {i !== displayed.split('\n').length - 1 && <br />}
        </span>
      ))}
    </>
  );
};

const quickPrompts = [
  { icon: TrendingUp, text: "Analyze my portfolio risk" },
  { icon: ShieldCheck, text: "How can I lower my debt?" },
  { icon: Sparkles, text: "Find unneeded subscriptions" }
];

export default function AIBrainPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExecutingTool, setIsExecutingTool] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const [selectedModel, setSelectedModel] = useState<"gemini-2.5-flash" | "gemini-2.5-pro">("gemini-2.5-flash");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Wrapped in useCallback so it doesn't trigger continuous re-renders in the TypewriterEffect
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // 1. Load History from Database on Mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) return;
      setIsLoadingHistory(true);
      const res = await getChatHistory(userId);
      
      if (res.success && res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        // First time user: Show welcome message (not saved to DB to keep it clean)
        setMessages([{
          id: 'welcome',
          role: "ai",
          content: "Welcome to KORE Brain. I am securely connected to your ledger. How can we optimize your wealth today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
      setIsLoadingHistory(false);
    };
    
    loadHistory();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // 2. Handle Chat Send & Database Saving
  const handleSend = async (e?: React.FormEvent, promptOverride?: string) => {
    e?.preventDefault();
    const textToSend = promptOverride || inputValue;
    if (!textToSend.trim() || !userId) return;

    // Temporary ID for UI
    const tempUserId = Date.now();
    const newUserMsg = {
      id: tempUserId,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setInputValue("");
    setIsTyping(true);

    // Save User Msg to DB asynchronously
    saveChatMessage({ userId, role: 'user', content: textToSend });

    // Format history for Gemini (excluding the fake welcome message)
    const apiHistory = updatedHistory.filter(m => m.id !== 'welcome').map(m => {
        let text = m.content;
        if (m.isToolCall && m.toolStatus === 'success') {
            text += `\n[SYSTEM NOTE: The tool '${m.toolName}' was successfully executed. Do not call it again for this specific request.]`;
        }
        return { role: m.role, content: text };
    });

    const result = await chatWithKoreBrain(userId, apiHistory, selectedModel);

    const tempAiId = Date.now() + 1;
    const newAIMsg = {
      id: tempAiId,
      role: "ai",
      content: result.success ? (result as any).text : "Error: Could not reach KORE Brain.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isToolCall: (result as any).isToolCall,
      toolName: (result as any).toolName,
      toolArgs: (result as any).toolArgs,
      toolStatus: (result as any).isToolCall ? 'pending' : undefined,
      isNew: true // <-- THIS FLAG TRIGGERS THE TYPEWRITER EFFECT
    };

    // Update UI immediately
    setMessages(prev => [...prev, newAIMsg]);
    setIsTyping(false);

    // Save AI response to DB, and get the REAL Database ID back
    if (result.success) {
        const dbSave = await saveChatMessage({
            userId,
            role: 'ai',
            content: newAIMsg.content,
            isToolCall: newAIMsg.isToolCall,
            toolName: newAIMsg.toolName,
            toolArgs: newAIMsg.toolArgs,
            toolStatus: newAIMsg.toolStatus
        });

        // Swap the temp ID for the real Database ID so tool updates work
        if (dbSave.success && dbSave.messageId) {
            setMessages(prev => prev.map(m => m.id === tempAiId ? { ...m, id: dbSave.messageId } : m));
        }
    }
  };

  // 3. Handle Tool Execution & Database Updating
  const handleExecuteTool = async (msgId: number | string, args: any) => {
    if (!userId) return;
    setIsExecutingTool(true);

    const res = await createTransaction({
      userId, accountId: args.accountId, title: args.merchant, category: args.category,
      amount: parseFloat(args.amount), type: args.type, date: args.date, status: 'completed'
    });

    if (res.success) {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, toolStatus: 'success' } : m));
      await updateChatToolStatus(msgId, 'success');
    } else {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, toolStatus: 'error' } : m));
      await updateChatToolStatus(msgId, 'error');
      alert("Failed to save transaction to ledger.");
    }
    setIsExecutingTool(false);
  };

  const handleCancelTool = async (msgId: number | string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, toolStatus: 'cancelled' } : m));
    await updateChatToolStatus(msgId, 'cancelled');
  };

  // 4. Handle Wiping the Database
  const clearChat = async () => {
    if (!userId) return;
    setMessages([{
      id: 'welcome',
      role: "ai",
      content: "Context cleared. Let's start fresh. What's on your mind?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    await clearChatHistory(userId);
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
          {isLoadingHistory ? (
             <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                 <Loader2 className="w-5 h-5 animate-spin" /> Loading memory...
             </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 w-full max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                      msg.role === 'ai' 
                        ? 'bg-gradient-to-br from-[var(--color-brand-deep)] to-[var(--color-brand-light)] text-white' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                    }`}>
                      {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-sm' 
                          : 'bg-white dark:bg-[#161B22] border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                      }`}>
                        
                        {/* CONDITIONAL RENDERING FOR TYPEWRITER */}
                        {msg.isNew ? (
                          <TypewriterEffect content={msg.content} onType={scrollToBottom} />
                        ) : (
                          msg.content.split('\n').map((line: string, i: number) => (
                            <span key={i}>
                              {line.includes('**') ? (
                                <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                              ) : line}
                              {i !== msg.content.split('\n').length - 1 && <br />}
                            </span>
                          ))
                        )}

                        {/* Interactive Tool Widget */}
                        {msg.isToolCall && msg.toolName === "create_transaction" && msg.toolArgs && (
                          <div className="mt-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-inner">
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Draft Transaction</h4>
                             <div className="space-y-2 mb-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Merchant</span><span className="font-semibold text-slate-900 dark:text-white break-all ml-4">{msg.toolArgs.merchant}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Amount</span><span className="font-bold text-[var(--color-brand-deep)]">{msg.toolArgs.amount}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Type</span><span className="capitalize font-medium text-slate-900 dark:text-white">{msg.toolArgs.type}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Category</span><span className="text-slate-900 dark:text-white text-right ml-4 break-words">{msg.toolArgs.category}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Date</span><span className="text-slate-900 dark:text-white">{msg.toolArgs.date}</span></div>
                             </div>
                             
                             {msg.toolStatus === 'pending' ? (
                                <div className="flex gap-2">
                                   <button 
                                     onClick={() => handleExecuteTool(msg.id, msg.toolArgs)} 
                                     disabled={isExecutingTool}
                                     className="flex-1 flex justify-center items-center bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-sm"
                                   >
                                     {isExecutingTool ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Save"}
                                   </button>
                                   <button 
                                     onClick={() => handleCancelTool(msg.id)} 
                                     disabled={isExecutingTool}
                                     className="flex-1 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-sm font-bold transition-colors"
                                   >
                                     Cancel
                                   </button>
                                </div>
                             ) : msg.toolStatus === 'success' ? (
                                <div className="flex justify-center items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold py-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                                   <CheckCircle2 className="w-4 h-4" /> Saved to Ledger
                                </div>
                             ) : (
                                <div className="flex justify-center items-center gap-2 text-slate-500 text-sm font-bold py-2.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                                   Cancelled
                                </div>
                             )}
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] text-slate-400 font-medium ${msg.role === 'user' ? 'text-right pr-1' : 'text-left pl-1'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </>
          )}

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
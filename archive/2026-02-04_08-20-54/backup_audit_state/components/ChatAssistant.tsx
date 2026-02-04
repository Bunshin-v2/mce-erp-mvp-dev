import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, Paperclip, Loader2, Zap, CheckSquare } from 'lucide-react';
import { agentRegistry, agentTaskWriter } from '../utils/agent';

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: 'Hello! I am your MCE Command Assistant. I have access to your 33+ projects and document registry. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await agentRegistry.knowledge.query(userMsg);
      setLoading(false);
      setIsTyping(true);

      let mainText = response.answer;
      let systemHeader = "";

      if (mainText.startsWith('DOC=')) {
        const parts = mainText.split('\n\n');
        systemHeader = parts[0];
        mainText = parts.slice(1).join('\n\n');
      }

      // Typing simulation
      let currentText = "";
      const words = mainText.split(' ');
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "",
        systemHeader: systemHeader,
        verifiability: response.verifiabilityScore,
        citations: response.citations
      }]);

      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1].text = currentText;
          return next;
        });
      }
      
      setIsTyping(false);
    } catch (err) {
      setLoading(false);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: "CRITICAL: Reasoning engine connection interrupted. System in fallback mode." }]);
    }
  };

  const handleAction = async (action: 'alert' | 'task', msgIndex: number) => {
    const msg = messages[msgIndex] as any;
    if (!msg || !msg.systemHeader) return;

    // Parse metadata from system header
    const metadata: any = {};
    msg.systemHeader.split(' ').forEach((token: string) => {
      const [key, val] = token.split('=');
      metadata[key.toLowerCase()] = val;
    });

    try {
      if (action === 'alert') {
        await agentTaskWriter.createAlertFromRAG(metadata);
        setMessages(prev => {
          const updated = [...prev];
          updated[msgIndex] = { ...updated[msgIndex], actionTaken: 'Alert Created' } as any;
          return updated;
        });
      } else if (action === 'task') {
        await agentTaskWriter.spawnTaskFromRAG(metadata);
        setMessages(prev => {
          const updated = [...prev];
          updated[msgIndex] = { ...updated[msgIndex], actionTaken: 'Task Spawned' } as any;
          return updated;
        });
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (<div className="fixed bottom-6 right-24 z-[500] font-sans">
    {!isOpen ? (
      <button
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 bg-[#00dc82] text-black rounded-full shadow-[0_0_30px_rgba(0,220,130,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-2 border-white/10"
        title="Nexus AI Assistant"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full border-2 border-[#00dc82] flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-[#00dc82] rounded-full animate-pulse"></div>
        </div>
        <Bot size={24} strokeWidth={2.5} />
      </button>
    ) : (
      <div className="w-[440px] h-[680px] bg-[#0f0f11]/95 backdrop-blur-3xl rounded-[2rem] shadow-5xl flex flex-col border border-white/10 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        {/* Elite Glass Header */}
        <div className="bg-white/[0.03] p-6 flex justify-between items-center border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <Sparkles size={18} className="text-[#00dc82]" />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-[0.2em] text-white uppercase font-sans">Intelligence Core</h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-1 h-1 bg-[#00dc82] rounded-full animate-pulse"></div>
                <p className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-black font-mono">Quantum Logic // Activated</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Messages - Machined Style */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-transparent custom-scrollbar">
          {messages.map((msg: any, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] space-y-3`}>
                {msg.role === 'assistant' && msg.systemHeader && (
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2 font-mono text-[8px] text-zinc-600 overflow-x-auto whitespace-nowrap shadow-inner">
                    <span className="text-emerald-500/60 mr-2 font-black">SYSTEM_SYNC:</span>
                    {msg.systemHeader}
                  </div>
                )}
                
                <div className={`p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-lg font-medium tracking-tight whitespace-pre-wrap ${msg.role === 'user'
                  ? 'bg-emerald-500 text-black rounded-tr-none'
                  : 'bg-white/[0.03] border border-white/[0.05] text-zinc-300 rounded-tl-none'
                  }`}>
                  {msg.text}
                  
                  {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 mr-2">
                        <Database size={10} className="text-zinc-600" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Grounding Citations</span>
                      </div>
                      {msg.citations.map((cit: string, idx: number) => (
                        <span key={idx} className="bg-white/5 text-[9px] text-[#00dc82] px-2 py-0.5 rounded-md border border-emerald-500/10 font-mono font-bold shadow-inner">
                          {cit}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'assistant' && msg.verifiability !== undefined && (
                  <div className="flex items-center gap-3 px-2">
                    <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_#00dc82]" 
                        style={{ width: `${(msg.verifiability / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest font-mono">
                      CONFIDENCE: {Math.round((msg.verifiability / 5) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl rounded-tl-none shadow-xl flex items-center space-x-4">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-[#00dc82] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#00dc82] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#00dc82] rounded-full animate-bounce"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#00dc82] font-black uppercase tracking-widest font-mono">Reasoning Engine</span>
                  <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-[0.2em] animate-pulse">Analyzing Vault Cluster 01...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actionable Input Zone */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5">
          <form onSubmit={handleSend} className="relative flex items-center bg-black/40 rounded-2xl px-5 py-4 border border-white/5 focus-within:border-emerald-500/30 focus-within:bg-black/60 transition-all shadow-2xl group">
            <Paperclip size={18} className="text-zinc-600 mr-4 cursor-pointer hover:text-emerald-400 transition-colors" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query MCE intelligence..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 font-semibold placeholder-zinc-700"
            />
            <button type="submit" disabled={!input.trim()} className="text-[#00dc82] disabled:opacity-20 hover:scale-110 transition-transform ml-3">
              <Send size={20} strokeWidth={2.5} />
            </button>
          </form>

          {/* Institutional Footer */}
          <div className="flex justify-center items-center mt-5 space-x-2">
            <Zap size={10} className="text-zinc-700" />
            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.3em] whitespace-nowrap font-mono">
              Morgan Intelligence Framework // Sonnet 4.5 Tier
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

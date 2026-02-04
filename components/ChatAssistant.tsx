import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Paperclip, Loader2, Zap, MessageSquare, Terminal } from 'lucide-react';
import { buildAssistantContext, retrieveRelevantContext, AssistantContext } from '@/lib/ai/assistant-context';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

/**
 * Mr. Morgan - Executive AI Assistant
 * Revamped 2026 UI | Golden State DNA | Tactical Presets
 */
export const ChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            text: 'I am Mr. Morgan. Your strategic command assistant. I have synchronized with the MCE registry. How shall we proceed with your tactical analysis?' 
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState<AssistantContext | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Tactical Presets - Matters & Answerable
    const presets = [
        { label: 'RISK_REPORT', query: 'Show me all projects with critical delivery risk ratings.' },
        { label: 'FISCAL_PULSE', query: 'What is the total AED value of the current tender pipeline?' },
        { label: 'TIMELINE_SYNC', query: 'List the top 5 upcoming project deadlines for February.' },
        { label: 'SYSTEM_STATUS', query: 'Check the health of the RAG knowledgebase and neural mesh.' }
    ];

    useEffect(() => {
        buildAssistantContext().then(ctx => setContext(ctx));
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, loading]);

    const handleSend = async (queryText?: string) => {
        const textToSend = queryText || input;
        if (!textToSend.trim() || loading || !context) return;

        const userMsg: Message = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const relevantContext = await retrieveRelevantContext(textToSend);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000);

            const chatRes = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: textToSend,
                    systemPrompt: context.systemPrompt,
                    context: relevantContext,
                    client: { app: 'vercel-nextjs', version: 'mr-morgan-v1' }
                }),
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
            
            const payload = await chatRes.json();
            const answer = payload?.response || payload?.data?.answer;

            const aiMessage: Message = { 
                role: 'assistant', 
                text: typeof answer === 'string' ? answer : 'Intelligence Core returned an invalid response.' 
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Signal interrupted. Please re-establish neural link." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[1000] font-sans">
            <AnimatePresence>
                {!isOpen ? (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 rounded-full bg-[var(--brand-accent)] shadow-[0_0_30px_rgba(81,162,168,0.4)] flex items-center justify-center text-white border-2 border-white/20 relative group"
                    >
                        <Bot size={28} strokeWidth={2.5} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--mce-red)] rounded-full border-2 border-white animate-pulse" />
                    </motion.button>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[420px] h-[650px] bg-white rounded-3xl shadow-5xl flex flex-col border-[4px] border-[var(--brand-accent)] overflow-hidden relative"
                    >
                        {/* Machined Edge Highlight */}
                        <div className="absolute inset-0 border border-white/20 pointer-events-none z-50 rounded-2xl" />

                        {/* HEADER - Executive Stealth */}
                        <div className="bg-[var(--brand-accent)] p-5 flex justify-between items-center shrink-0">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                                    <Terminal size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black italic text-white font-oswald uppercase tracking-widest">Mr. Morgan</h3>
                                    <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.3em]">Neural_Command_Interface</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* MESSAGES - Tactical Feed */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                            {messages.map((msg, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i} 
                                    className={cn("flex w-full", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                                >
                                    <div className={cn(
                                        "max-w-[85%] px-5 py-4 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm",
                                        msg.role === 'user'
                                            ? 'bg-[var(--brand-accent)] text-white rounded-br-sm'
                                            : 'bg-white border border-[var(--surface-border)] text-[var(--text-primary)] rounded-bl-sm font-oswald italic font-bold'
                                    )}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-[var(--surface-border)] px-5 py-4 rounded-2xl rounded-bl-sm flex items-center space-x-3">
                                        <Loader2 className="animate-spin text-[var(--brand-accent)]" size={16} />
                                        <span className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest italic">Analyzing_Data...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PRESET ACTIONS - Matters & Answerable */}
                        <div className="px-6 py-4 bg-white border-t border-[var(--surface-border)] shrink-0">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-3 opacity-60 italic">Tactical_Shortcuts</p>
                            <div className="flex flex-wrap gap-2">
                                {presets.map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handleSend(preset.query)}
                                        className="px-3 py-1.5 rounded-md border border-[var(--brand-accent)]/20 text-[9px] font-black italic uppercase tracking-wider text-[var(--brand-accent)] hover:bg-[var(--brand-accent)] hover:text-white transition-all font-oswald"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* INPUT AREA */}
                        <div className="p-6 bg-white border-t border-[var(--surface-border)] shrink-0">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                                className="relative flex items-center bg-slate-100 rounded-2xl border-2 border-transparent focus-within:border-[var(--brand-accent)] focus-within:bg-white transition-all overflow-hidden shadow-inner"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Execute command..."
                                    className="flex-1 bg-transparent border-none outline-none text-[13px] px-5 py-4 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="mr-3 p-2 bg-[var(--brand-accent)] text-white rounded-xl disabled:opacity-20 hover:scale-105 transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
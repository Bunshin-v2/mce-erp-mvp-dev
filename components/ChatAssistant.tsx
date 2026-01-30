
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Paperclip, Loader2, Zap } from 'lucide-react';
import { buildAssistantContext, retrieveRelevantContext, AssistantContext } from '@/lib/ai/assistant-context';
import { GlassButton } from '@/components/ui/GlassButton';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export const ChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: 'Hello! I\'m your MCE Assistant. I can help with projects, tenders, documents, tasks, and more. What can I assist with?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState<AssistantContext | null>(null);
    const [scopeSummary, setScopeSummary] = useState('');
    const [scopeKeywords, setScopeKeywords] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load assistant context on mount
    useEffect(() => {
        buildAssistantContext().then(ctx => setContext(ctx));
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, loading]);

    useEffect(() => {
        let isMounted = true;
        fetch('/api/ai/scope')
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                if (data?.scope) {
                    setScopeSummary(data.scope.summary || 'AI scope overview');
                    setScopeKeywords(data.scope.keywords || []);
                }
            })
            .catch(err => {
                console.error('Failed to load scope keywords:', err);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const handleScopeChip = (keyword: string) => {
        if (!keyword.trim()) return;
        setInput(keyword);
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !context) return;

        const userMsg: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            // Retrieve relevant context for this query
            const relevantContext = await retrieveRelevantContext(currentInput);

            // Send to AI Gateway with system context and relevant prompts
            // Send to AI Gateway with system context and relevant prompts
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s client timeout

            const chatRes = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: currentInput,
                    systemPrompt: context.systemPrompt,
                    context: relevantContext,
                    client: { app: 'vercel-nextjs', version: 'mce-assistant-v1' }
                }),
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
            const payload = await chatRes.json();

            if (!chatRes.ok) {
                const errorCode = payload?.error?.code || 'AI_GATEWAY_ERROR';
                const errorMessage = payload?.error?.message || 'AI Gateway request failed.';
                throw new Error(`${errorCode}: ${errorMessage}`);
            }

            const outcome = payload?.outcome;
            // Support both local (payload.response) and gateway (payload.data.answer) formats
            const answer = payload?.response || payload?.data?.answer;

            const text =
                typeof answer === 'string' && answer.trim()
                    ? answer
                    : outcome === 'refused'
                        ? 'I don\'t have sufficient evidence to answer that. Try asking about projects, tenders, documents, or system features.'
                        : 'AI Service returned an invalid response.';

            const aiMessage: Message = { role: 'assistant', text };
            setMessages(prev => [...prev, aiMessage]);

        } catch (err: any) {
            console.error(err);
            let errorMessage = "Sorry, I encountered an error. Please try again.";

            if (err.name === 'AbortError') {
                errorMessage = "The request timed out. The AI service might be waking up, please try again.";
            } else if (err.message.includes('AI_GATEWAY_TIMEOUT') || err.message.includes('504')) {
                errorMessage = "AI Service is busy. Please try again in a moment.";
            } else if (err.message.includes('AI_GATEWAY_UNREACHABLE') || err.message.includes('503')) {
                errorMessage = "AI Service is currently offline. Please check system status.";
            }

            setMessages(prev => [...prev, { role: 'assistant', text: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-8 z-[500] font-sans">
            {!isOpen ? (
                <GlassButton
                    onClick={() => setIsOpen(true)}
                    variant="primary"
                    size="icon"
                    className="w-14 h-14 rounded-full shadow-lg hover:scale-110 active:scale-95 border-white/10 hover:bg-[var(--brand-primary-hover)] group"
                    title="Nexus AI Assistant"
                >
                    <Bot size={24} strokeWidth={2} />
                </GlassButton>
            ) : (
                <div className="w-[400px] h-[600px] bg-[var(--bg-surface)] backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col border border-[var(--border-subtle)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* HEADER */}
                    <div className="bg-[var(--bg-base)] p-4 flex justify-between items-center border-b border-[var(--border-subtle)]">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[var(--brand-primary)]/10 rounded-lg flex items-center justify-center border border-[var(--brand-primary)]/20">
                                <Sparkles size={16} className="text-[var(--brand-primary)]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">MCE Assistant</h3>
                                <p className="text-[10px] text-[var(--text-secondary)]">Powered by Nexus AI</p>
                            </div>
                        </div>
                        <GlassButton
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                            <X size={18} />
                        </GlassButton>
                    </div>

                    {/* SCOPE CHIPS */}
                    {(scopeKeywords.length > 0 || scopeSummary) && (
                        <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-active)]/30 space-y-2">
                            {scopeKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {scopeKeywords.map(keyword => (
                                        <GlassButton
                                            key={keyword}
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleScopeChip(keyword)}
                                            className="h-auto py-1 px-2.5 rounded-full text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/50"
                                        >
                                            {keyword}
                                        </GlassButton>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* MESSAGES */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--bg-base)]/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-[var(--brand-primary)] text-white rounded-br-sm'
                                    : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-bl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center space-x-2.5">
                                    <Loader2 className="animate-spin text-[var(--brand-primary)]" size={14} />
                                    <span className="text-xs text-[var(--text-secondary)] font-medium">Processing...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* INPUT AREA */}
                    <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
                        <form onSubmit={handleSend} className="relative flex items-center bg-[var(--bg-input)] rounded-xl border border-[var(--border-subtle)] focus-within:border-[var(--brand-primary)]/50 transition-colors">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about projects, tenders..."
                                className="flex-1 bg-transparent border-none outline-none text-sm px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                            />
                            <GlassButton
                                type="submit"
                                variant="ghost"
                                size="icon"
                                disabled={!input.trim()}
                                className="mr-1 text-[var(--brand-primary)] disabled:opacity-30 hover:bg-[var(--brand-primary)]/10"
                            >
                                <Send size={18} />
                            </GlassButton>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

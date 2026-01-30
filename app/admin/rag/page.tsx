"use client";

import { useState } from "react";
import { DocumentSyncPanel } from "@/components/admin/DocumentSyncPanel";
import { Database, Zap, BookOpen, Terminal } from "lucide-react";
import { useToast } from "@/lib/toast-context";

export default function RagIngestPage() {
    const [documentId, setDocumentId] = useState("");
    const [text, setText] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [logs, setLogs] = useState<string[]>([]);
    const toast = useToast();

    const handleIngest = async () => {
        if (!documentId || !text) return;

        setStatus("loading");
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${timestamp}] INITIALIZING_VECTOR_NODE: ${documentId}`, ...prev]);

        try {
            const res = await fetch("/api/rag/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId, text }),
            });

            const data = await res.json().catch(() => null);

            if (res.status === 410) {
                setStatus("error");
                toast.info(
                    "Ingestion Disabled on Vercel",
                    "Run `npm run rag:ingest` locally or use the external AI Gateway indexing worker."
                );
                setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ⚠ DISABLED: VERCEL_RAG_INGEST_ENDPOINT`, ...prev]);
                return;
            }

            if (res.ok) {
                setStatus("success");
                const chunks = data?.chunks ?? 'unknown';
                toast.success("Node Initialized", `Processed ${chunks} segments successfully.`);
                setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ✅ SUCCESS: Processed ${chunks} chunks.`, ...prev]);
                setText("");
            } else {
                setStatus("error");
                const message = data?.error || 'Initialization failed.';
                toast.error("Initialization Failed", message);
                setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ❌ ERROR: ${message}`, ...prev]);
            }
        } catch (err: any) {
            setStatus("error");
            toast.error("Fatal System Error", err.message);
            setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ❌ FATAL_NETWORK_ERROR: ${err.message}`, ...prev]);
        }
    };

    return (
        <div className="min-h-screen bg-gov-bg text-white p-[var(--gov-s4)] font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center text-brand-500 shadow-glow">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold italic text-white uppercase tracking-tight">
                                Intelligence Core Command
                            </h1>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                RAG Neural Interface • Version 2.0
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Manual Ingestion */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="matte-surface border border-white/5 p-6 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen size={16} className="text-zinc-500" />
                                <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Manual Node Ingestion</h2>
                            </div>
                            
                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">
                                    Node Identifier (UUID/Title)
                                </label>
                                <input
                                    type="text"
                                    value={documentId}
                                    onChange={(e) => setDocumentId(e.target.value)}
                                    placeholder="e.g., CONTRACT_VILLA_SPRINGS_V1"
                                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-xs font-mono text-white outline-none focus:border-brand-500/30 transition-all uppercase placeholder:text-zinc-800"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">
                                    Raw Knowledge Content
                                </label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={12}
                                    placeholder="PASTE_KNOWLEDGE_PAYLOAD_HERE..."
                                    className="w-full bg-black/40 border border-white/5 rounded-lg p-3 text-[11px] font-mono text-zinc-300 outline-none focus:border-brand-500/30 transition-all placeholder:text-zinc-800"
                                />
                            </div>

                            <button
                                onClick={handleIngest}
                                disabled={status === "loading" || !documentId || !text}
                                className={`w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${status === "loading"
                                        ? "bg-zinc-800 cursor-wait text-zinc-500"
                                        : "bg-brand-500 hover:bg-brand-600 text-white shadow-glow"
                                    }`}
                            >
                                {status === "loading" ? "Processing_Neural_Paths..." : "Initialize_Node"}
                            </button>
                        </div>

                        {/* Logs Terminal */}
                        <div className="matte-surface border border-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Terminal size={14} className="text-emerald-500" />
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-emerald-500/80">Activity_Stream</span>
                            </div>
                            <div className="bg-black/60 rounded p-4 font-mono text-[10px] text-zinc-400 h-48 overflow-y-auto border border-white/[0.02]">
                                {logs.length > 0 ? logs.map((log, i) => (
                                    <div key={i} className="mb-1">{log}</div>
                                )) : (
                                    <div className="text-zinc-800 italic">SYSTEM_IDLE... AWAITING_PAYLOAD</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Retroactive Sync */}
                    <div className="space-y-6">
                        <DocumentSyncPanel />
                        
                        <div className="p-6 border border-white/5 rounded-xl bg-white/[0.01]">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Neural_Configuration</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-600 uppercase">Vector_Dimension</span>
                                    <span className="text-[10px] font-mono text-emerald-500">1536 (LOCKED)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-600 uppercase">Model_Reference</span>
                                    <span className="text-[10px] font-mono text-zinc-400">GEMINI-2.5-FLASH</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-600 uppercase">Search_Mode</span>
                                    <span className="text-[10px] font-mono text-zinc-400">HYBRID_SEMANTIC</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { BrainCircuit, Check, AlertCircle, Loader2 } from "lucide-react";

interface RagSyncButtonProps {
    documentId: string;
    data: any;
    label?: string;
    className?: string;
}

export function RagSyncButton({ documentId, data, label = "Sync to Brain", className }: RagSyncButtonProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSync = async () => {
        setStatus("loading");
        try {
            // Convert data to a string representation for RAG
            const textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

            const res = await fetch("/api/rag/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    documentId,
                    text: `Project Data: ${documentId}\n\n${textContent}`,
                }),
            });

            if (res.status === 410) {
                console.warn('RAG ingestion is disabled on Vercel; use AI Gateway worker.');
                setStatus("error");
                setTimeout(() => setStatus("idle"), 3000);
                return;
            }

            if (res.ok) {
                setStatus("success");
                setTimeout(() => setStatus("idle"), 3000); // Reset after 3s
            } else {
                setStatus("error");
                setTimeout(() => setStatus("idle"), 3000);
            }
        } catch (error) {
            console.error("Sync failed:", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleSync}
            disabled={status === "loading" || status === "success"}
            className={`${className} transition-all duration-300 ${status === "success"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                    : status === "error"
                        ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
                        : ""
                }`}
        >
            {status === "loading" && <Loader2 size={14} className="mr-2 animate-spin" />}
            {status === "success" && <Check size={14} className="mr-2" />}
            {status === "error" && <AlertCircle size={14} className="mr-2" />}
            {status === "idle" && <BrainCircuit size={14} className="mr-2 text-violet-400" />}

            {status === "loading" ? "Syncing..." :
                status === "success" ? "Synced" :
                    status === "error" ? "Failed" :
                        label}
        </GlassButton>
    );
}

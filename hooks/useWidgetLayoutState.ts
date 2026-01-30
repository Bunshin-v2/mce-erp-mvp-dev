import { useEffect, useMemo, useState } from "react";

export type WidgetMode = "compact" | "expanded";
export type WidgetId =
    | "kpi_band"
    | "project_portfolio"
    | "tender_tracker"
    | "risk_command"
    | "deadlines"
    | "liability_tracker";

export type WidgetGroup = "kpi" | "work" | "command";

export type WidgetState = {
    mode: WidgetMode;
    pinned?: boolean; // pinned widgets can't be collapsed/hidden
};

type LayoutState = Record<WidgetId, WidgetState>;

const STORAGE_KEY = "morgan.dashboard.widgetLayout.v1";

const DEFAULTS: LayoutState = {
    kpi_band: { mode: "compact" },
    project_portfolio: { mode: "compact" },
    tender_tracker: { mode: "compact" },
    risk_command: { mode: "compact", pinned: true },
    deadlines: { mode: "compact", pinned: true },
    liability_tracker: { mode: "compact" },
};

const GROUPS: Record<WidgetId, WidgetGroup> = {
    kpi_band: "kpi",
    project_portfolio: "work",
    tender_tracker: "work",
    risk_command: "command",
    deadlines: "command",
    liability_tracker: "command",
};

export function useWidgetLayoutState(params?: {
    // optional auto-expand signals
    criticalHazards?: number;
    complianceBreach?: boolean;
}) {
    const { criticalHazards = 0, complianceBreach = false } = params || {};

    const [state, setState] = useState<LayoutState>(() => {
        try {
            if (typeof window === 'undefined') return DEFAULTS;
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return DEFAULTS;
            return { ...DEFAULTS, ...(JSON.parse(raw) as LayoutState) };
        } catch {
            return DEFAULTS;
        }
    });

    // persist
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch { }
    }, [state]);

    const setMode = (id: WidgetId, mode: WidgetMode) => {
        setState((prev) => {
            const next = { ...prev };

            // pinned widgets can expand/compact, but we still enforce accordion within group
            const group = GROUPS[id];

            // Accordion rule: one expanded per group
            if (mode === "expanded") {
                (Object.keys(next) as WidgetId[]).forEach((key) => {
                    if (key !== id && GROUPS[key] === group) {
                        next[key] = { ...next[key], mode: "compact" };
                    }
                });
            }

            next[id] = { ...next[id], mode };
            return next;
        });
    };

    const toggle = (id: WidgetId) => {
        const current = state[id]?.mode ?? "compact";
        setMode(id, current === "compact" ? "expanded" : "compact");
    };

    // Auto-expand rules (simple v1)
    useEffect(() => {
        // Example: if hazards > 0, expand risk command once
        if (criticalHazards > 0) {
            setState((prev) => {
                if (prev.risk_command.mode === "expanded") return prev;
                return { ...prev, risk_command: { ...prev.risk_command, mode: "expanded" } };
            });
        }
    }, [criticalHazards]);

    useEffect(() => {
        // compliance breach -> expand deadlines (or a compliance widget if you add one)
        if (complianceBreach) {
            setState((prev) => {
                if (prev.deadlines.mode === "expanded") return prev;
                return { ...prev, deadlines: { ...prev.deadlines, mode: "expanded" } };
            });
        }
    }, [complianceBreach]);

    const api = useMemo(
        () => ({
            state,
            setMode,
            toggle,
        }),
        [state]
    );

    return api;
}

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  PieChart,
  Users,
  Settings,
  Activity,
  Bot,
  Globe,
  Zap,
  Plus,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Star,
  Folder,
  BarChart,
  Lock,
  Info,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useUserTier } from '../hooks/useUserTier';
import { useDashboardData } from '../hooks/useDashboardData';
import { supabase } from '../lib/supabase';
import * as Icons from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  requiredTier?: string;
  subItems?: MenuItem[];
  customTab?: {
    url: string | null;
    viewId: string | null;
  };
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

/**
 * APPLE-GRADE PRODUCTION SIDEBAR (V3 FINAL)
 * Minimalist | Obsessively Aligned | Flattened Hierarchy
 */
export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  collapsed,
  onToggle
}) => {
  const [customTabs, setCustomTabs] = useState<any[]>([]);
  const [expandedItems, setExpandedGroups] = useState<string[]>(['mesh']);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]); // New state for section collapse

  const { tier, hasPermission, loading: tierLoading } = useUserTier();
  const { alerts } = useDashboardData();
  const hasUnreadAlerts = alerts.length > 0;

  useEffect(() => { fetchCustomTabs(); }, []);

  const toggleSection = (title: string) => {
    setCollapsedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const fetchCustomTabs = async () => {
    try {
      const { data } = await supabase
        .from('custom_sidebar_tabs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setCustomTabs(data);
    } catch (err) { console.error('Tab sync failed:', err); }
  };

  const toggleExpand = (id: string) => {
    setExpandedGroups(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  let clerk: any;
  try { clerk = useClerk(); } catch (e) { clerk = null; }

  const handleLogout = () => { if (clerk) clerk.signOut(); };

  const menuGroups: MenuGroup[] = [
    {
      title: 'PORTFOLIO',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Building2 },
        { id: 'tenders', label: 'Tenders', icon: Briefcase },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'liability', label: 'Risk & Liability', icon: ShieldAlert },
        { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
        { id: 'calendar', label: 'Calendar', icon: Icons.Calendar },
        { id: 'cockpit', label: 'Executive Cockpit', icon: Activity, requiredTier: 'L3' },
      ]
    },
    {
      title: 'FINANCIAL',
      items: [
        { id: 'financials', label: 'Financials', icon: PieChart },
        { id: 'reports', label: 'Reports', icon: FileText },
      ]
    },
    {
      title: 'TEAM & MESH',
      items: [
        {
          id: 'mesh',
          label: 'Intelligence Mesh',
          icon: Globe,
          subItems: [
            { id: 'integrations', label: 'Mesh Sync', icon: Zap },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'agents', label: 'Agents', icon: Bot, requiredTier: 'L3' },
          ]
        },
      ]
    },
  ];

  // Process and filter menu groups
  const filterItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // const permitted = !item.requiredTier || (!tierLoading && hasPermission(item.requiredTier as any));
      const permitted = true; // FORCE RESTORE ALL ITEMS
      if (!permitted) return false;

      if (item.subItems) {
        item.subItems = filterItems(item.subItems);
        return item.subItems.length > 0;
      }
      return true;
    });
  };

  let visibleMenuGroups = menuGroups.map(group => ({
    ...group,
    items: filterItems(group.items)
  })).filter(group => group.items.length > 0);

  // Inject Custom Tabs
  customTabs.forEach(tab => {
    if (tab.required_tier && !hasPermission(tab.required_tier)) return;
    const IconComponent = (Icons as any)[tab.icon_name] || Star;
    const customItem: MenuItem = {
      id: tab.target_view || tab.id,
      label: tab.label,
      icon: IconComponent,
      customTab: { url: tab.target_url, viewId: tab.target_view }
    };
    const gIdx = visibleMenuGroups.findIndex(g => g.title === tab.group_title);
    if (gIdx !== -1) visibleMenuGroups[gIdx].items.push(customItem);
    else visibleMenuGroups.push({ title: tab.group_title, items: [customItem] });
  });

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activeView === item.id || (item.subItems?.some(s => s.id === activeView));

    return (
      <React.Fragment key={item.id}>
        <button
          onClick={() => {
            if (item.subItems) {
              toggleExpand(item.id);
            } else if (item.customTab?.url) {
              window.open(item.customTab.url, '_blank');
            } else {
              onNavigate(item.id);
            }
          }}
          aria-label={item.label}
          className={`w-full flex items-center h-[36px] px-4 rounded-lg transition-all duration-300 group relative ${isActive && !item.subItems
            ? 'bg-[var(--bg-active)] text-[var(--text-primary)] shadow-sm border border-[var(--surface-border)]'
            : 'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]'
            }`}

        >
          {isActive && !item.subItems && (
            <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-[var(--accent-primary)] rounded-r-full shadow-glow"></div>
          )}
          <div className={`flex items-center justify-center w-4 shrink-0 transition-colors ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text)]'}`}>
            <item.icon size={isSubItem ? 12 : 14} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          {!collapsed && (
            <span
              className={`ml-4 transition-colors whitespace-nowrap flex-1 text-left text-[11px] font-oswald font-bold italic uppercase tracking-[0.15em] ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'
                }`}
            >
              {item.label}
            </span>
          )}

          {!collapsed && item.subItems && (
            <ChevronDown size={11} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
          {collapsed && (
            <div className="absolute left-[54px] px-3 py-1.5 bg-zinc-900 text-white font-bold italic tracking-wider rounded border border-zinc-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-2xl z-[60]" style={{ fontSize: `var(--sidebar-text-size, 0.75rem)` }}>
              {item.label}
            </div>
          )}
        </button>
        {!collapsed && item.subItems && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.subItems.map(sub => renderMenuItem(sub, true))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen overflow-hidden bg-[var(--sidebar-bg)] backdrop-blur-2xl border-r border-[var(--sidebar-border)] transition-all duration-300 z-50 flex flex-col group/sidebar ${collapsed ? 'w-[64px]' : 'w-[156px]'}`}
      style={{
        boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.03)'
      }}>

      {/* BRAND APEX (2026 AAA Grade) */}
      <div className="h-12 flex items-center relative bg-[var(--morgan-sidebar)]">
        <div className={`flex items-center transition-all duration-300 ${collapsed ? 'opacity-0 scale-50' : 'opacity-100 scale-100 pl-[24px]'}`}>
          <span className="font-oswald italic font-black text-[22px] tracking-tight select-none text-[var(--sidebar-text)]">
            Morgan
          </span>
        </div>

        {collapsed && (
          <div className="absolute inset-y-0 left-0 w-[64px] flex items-center justify-start pl-[24px]">
            <span className="font-oswald font-black italic text-[24px] text-[var(--sidebar-text)] select-none">
              M
            </span>
          </div>
        )}

        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="absolute right-[-10px] top-1/2 -translate-y-1/2 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] text-[var(--sidebar-text-muted)] p-0.5 rounded-full hover:text-[var(--sidebar-text)] transition-all z-50 opacity-0 group-hover/sidebar:opacity-100 shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* CORE NAVIGATION */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-y-8 overflow-y-auto no-scrollbar scroll-smooth justify-between">
        {visibleMenuGroups.map((group, idx) => {
          const isSectionCollapsed = collapsedSections.includes(group.title);
          return (
            <div key={idx} className="flex flex-col gap-y-0.5">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(group.title)}
                  aria-label={`${isSectionCollapsed ? 'Expand' : 'Collapse'} ${group.title} section`}
                  className="w-full flex items-center justify-between px-2 mb-[var(--space-2)] group/section hover:bg-[var(--sidebar-hover)] rounded-md transition-all cursor-pointer"
                >
                  <h4
                    className="flex-1 text-left text-[10px] text-text-tertiary uppercase tracking-[0.2em] font-oswald font-bold italic group-hover/section:text-[var(--text-secondary)] transition-colors"
                  >
                    {group.title}
                  </h4>
                  <ChevronDown
                    size={10}
                    className={`text-[var(--text-tertiary)] group-hover/section:text-[var(--text-secondary)] transition-transform duration-300 shrink-0 ${isSectionCollapsed ? '-rotate-90' : 'rotate-0'}`}
                  />
                </button>
              )}
              <div className={`flex flex-col gap-y-0.5 overflow-hidden transition-all duration-300 ${isSectionCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                {group.items.map((item) => renderMenuItem(item))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* SYSTEM ANCHOR ZONE */}
      <div className="border-t border-[var(--sidebar-border)] px-2 py-3 space-y-0.5 mt-auto bg-black/10">

        {/* Profile */}
        <button
          onClick={() => onNavigate('profile')}
          aria-label="User Profile"
          className={`w-full flex items-center h-[36px] px-4 rounded-md text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-4 flex justify-center shrink-0">
            <Users size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-4 text-[11px] font-oswald font-bold italic uppercase tracking-[0.15em]">Profile</span>}
        </button>

        {/* Settings */}
        <button
          onClick={() => onNavigate('settings')}
          aria-label="System Settings"
          className={`w-full flex items-center h-[36px] px-4 rounded-md text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-4 flex justify-center shrink-0">
            <Settings size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-4 text-[11px] font-oswald font-bold italic uppercase tracking-[0.15em]">Settings</span>}
        </button>

        <div className="h-1" />

        {/* Terminal (Logout) */}
        <button
          onClick={handleLogout}
          aria-label="Terminal Logout"
          className={`w-full flex items-center h-[36px] px-4 rounded-md text-[var(--sidebar-text-muted)] hover:text-[var(--color-critical)] hover:bg-[var(--color-critical)]/10 transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-4 flex justify-center shrink-0">
            <LogOut size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-4 text-[11px] font-oswald font-bold italic uppercase tracking-[0.15em]">Terminal</span>}
        </button>
      </div>

    </aside>
  );
};
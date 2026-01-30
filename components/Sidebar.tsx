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
          className={`w-full flex items-center h-8 px-3 rounded-lg transition-all duration-300 group relative ${isActive && !item.subItems
            ? 'bg-white/10 text-white shadow-sm border border-white/5'
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}

        >
          {isActive && !item.subItems && (
            <div className="absolute left-0 top-[25%] bottom-[25%] w-[3px] bg-emerald-500 rounded-r-full shadow-glow"></div>
          )}
          <div className={`flex items-center justify-center w-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
            <item.icon size={isSubItem ? 12 : 15} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          {!collapsed && (
            <span
              className={`ml-3 transition-colors whitespace-nowrap flex-1 text-left text-[11px] font-bold italic uppercase tracking-widest ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
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
    <aside className={`fixed left-0 top-0 h-screen overflow-hidden bg-zinc-950/30 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 z-50 flex flex-col group/sidebar ${collapsed ? 'w-[64px]' : 'w-[156px]'}`}
      style={{
        boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.03)'
      }}>

      {/* BRAND APEX (2026 AAA Grade) */}
      <div className={`h-14 flex items-center border-b border-white/5 relative transition-all duration-300 ${collapsed ? 'justify-center' : 'pl-8 pr-4'}`}>
        <div className={`flex items-center transition-all duration-300 ${collapsed ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
          <span className="text-2xl font-black italic tracking-tight font-display text-white select-none">
            Morgan<span className="text-brand-500">.</span>
          </span>
        </div>

        {collapsed && (
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-black italic text-white font-display select-none">
            M<span className="text-brand-500">.</span>
          </span>
        )}

        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="absolute right-[-10px] top-[18px] bg-zinc-900 border border-white/10 text-zinc-400 p-0.5 rounded-full hover:text-white transition-all z-50 opacity-0 group-hover/sidebar:opacity-100 shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* CORE NAVIGATION */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto no-scrollbar scroll-smooth">
        {visibleMenuGroups.map((group, idx) => {
          const isSectionCollapsed = collapsedSections.includes(group.title);
          return (
            <div key={idx} className="space-y-0.5">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(group.title)}
                  aria-label={`${isSectionCollapsed ? 'Expand' : 'Collapse'} ${group.title} section`}
                  className="w-full flex items-center justify-between px-2 py-1.5 group/section hover:bg-white/5 rounded-md transition-all cursor-pointer mb-0.5"
                >
                  <h4
                    className="flex-1 text-left text-zinc-500 text-[10px] font-bold italic tracking-widest uppercase group-hover/section:text-zinc-300 transition-colors"
                  >
                    {group.title}
                  </h4>
                  <ChevronDown
                    size={10}
                    className={`text-zinc-600 group-hover/section:text-zinc-400 transition-transform duration-300 shrink-0 ${isSectionCollapsed ? '-rotate-90' : 'rotate-0'}`}
                  />
                </button>
              )}
              <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${isSectionCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                {group.items.map((item) => renderMenuItem(item))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* SYSTEM ANCHOR ZONE */}
      <div className="border-t border-white/5 px-2 py-3 space-y-0.5 mt-auto bg-black/20">

        {/* Profile */}
        <button
          onClick={() => onNavigate('profile')}
          aria-label="User Profile"
          className={`w-full flex items-center h-[34px] px-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-4 flex justify-center shrink-0">
            <Users size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-3 text-[11px] font-bold italic uppercase tracking-widest">Profile</span>}
        </button>

        {/* Settings */}
        <button
          onClick={() => onNavigate('settings')}
          aria-label="System Settings"
          className={`w-full flex items-center h-[34px] px-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-4 flex justify-center shrink-0">
            <Settings size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-3 text-[11px] font-bold italic uppercase tracking-widest">Settings</span>}
        </button>

        <div className="h-1" />

        {/* Terminal (Logout) */}
        <button
          onClick={handleLogout}
          aria-label="Terminal Logout"
          className={`w-full flex items-center h-[34px] px-2 rounded-md text-zinc-400 hover:text-critical hover:bg-critical/10 transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-4 flex justify-center shrink-0">
            <LogOut size={14} strokeWidth={1.5} />
          </div>
          {!collapsed && <span className="ml-3 text-[11px] font-bold italic uppercase tracking-widest">Terminal</span>}
        </button>
      </div>

    </aside>
  );
};
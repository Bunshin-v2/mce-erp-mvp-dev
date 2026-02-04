import React, { useState } from 'react';
import { User, Shield, Briefcase, Search, MoreVertical, CheckCircle2, Crown, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';

// Mock Data for UI Dev (This will later connect to Supabase Profiles)
const MOCK_USERS = [
  { id: '1', name: 'Ali Al-Mansoori', email: 'ali.m@morgan.com', role: 'Chairman', tier: 'L3', dept: 'Executive', avatar: null, status: 'active' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@morgan.com', role: 'Dept Head', tier: 'L2', dept: 'Operations', avatar: null, status: 'active' },
  { id: '3', name: 'Mohammed Khalil', email: 'mo.k@morgan.com', role: 'Engineer', tier: 'L1', dept: 'Projects', avatar: null, status: 'active' },
  { id: '4', name: 'System Admin', email: 'admin@morgan.com', role: 'Super Admin', tier: 'L4', dept: 'IT', avatar: null, status: 'active' },
];

const ROLES = [
  { label: 'Staff / Engineer', value: 'Engineer', tier: 'L1', color: 'bg-slate-500' },
  { label: 'Dept Head / Manager', value: 'Dept Head', tier: 'L2', color: 'bg-blue-500' },
  { label: 'Executive / Chairman', value: 'Chairman', tier: 'L3', color: 'bg-emerald-500' },
  { label: 'Super Admin', value: 'Super Admin', tier: 'L4', color: 'bg-rose-500' },
];

export const TeamManagement: React.FC = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  const getTierBadge = (tier: string) => {
    switch(tier) {
      case 'L4': return <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider"><ShieldAlert size={10} /> <span>L4 Platinum</span></span>;
      case 'L3': return <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider"><Crown size={10} /> <span>L3 Gold</span></span>;
      case 'L2': return <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider"><Shield size={10} /> <span>L2 Silver</span></span>;
      default: return <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-500/20 text-slate-200 border border-slate-500/30 text-[10px] font-bold uppercase tracking-wider"><User size={10} /> <span>L1 Bronze</span></span>;
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    const roleDef = ROLES.find(r => r.value === newRole);
    if (!roleDef) return;

    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole, tier: roleDef.tier } : u));
    // Here we would call supabase.rpc('update_user_role', { userId, newRole })
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface-layer)] backdrop-blur-xl p-5 rounded-2xl border border-[var(--surface-border)] shadow-sm">
         <div>
            <h3 className="text-lg font-bold text-white flex items-center">
               <Briefcase className="mr-2 text-[#33CCCC]" size={20} /> Team Access Control
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Manage global permissions and department assignments.</p>
         </div>
         <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-[#33CCCC] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search team members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#33CCCC] transition-all w-full md:w-64"
            />
         </div>
      </div>

      {/* User Grid */}
      <div className="bg-[var(--surface-layer)] backdrop-blur-xl border border-[var(--surface-border)] rounded-2xl shadow-sm overflow-hidden">
         <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[var(--surface-base)] border-b border-[var(--surface-border)] text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-4">User Identity</div>
            <div className="col-span-3">Department</div>
            <div className="col-span-3">Access Level</div>
            <div className="col-span-2 text-right">Actions</div>
         </div>

         <div className="divide-y divide-[var(--surface-border)]">
            {filteredUsers.map((user) => (
               <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--surface-elevated)] transition-colors group">
                  {/* Identity */}
                  <div className="col-span-4 flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold border border-zinc-700 shadow-inner">
                        {user.name.charAt(0)}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#33CCCC] transition-colors">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                     </div>
                  </div>

                  {/* Department */}
                  <div className="col-span-3">
                     <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs border border-zinc-700">
                        {user.dept}
                     </span>
                  </div>

                  {/* Access Level (Role Selector) */}
                  <div className="col-span-3">
                     <div className="space-y-2">
                        {getTierBadge(user.tier)}
                        <select 
                           value={user.role}
                           onChange={(e) => handleRoleChange(user.id, e.target.value)}
                           className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-[#33CCCC] cursor-pointer"
                        >
                           {ROLES.map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 text-right">
                     <button className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                        <MoreVertical size={16} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
         {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-sm">No team members found.</div>
         )}
      </div>

      {/* Security Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { label: 'L1 Staff', desc: 'Personal Tasks Only', color: 'border-zinc-700 text-zinc-400' },
            { label: 'L2 Manager', desc: 'Department + Team', color: 'border-blue-500/30 text-blue-400' },
            { label: 'L3 Executive', desc: 'Full Portfolio + Risk', color: 'border-emerald-500/30 text-emerald-400' },
            { label: 'L4 Admin', desc: 'System Configuration', color: 'border-rose-500/30 text-rose-400' },
         ].map((tier, i) => (
            <div key={i} className={`bg-[var(--surface-layer)] border ${tier.color} rounded-xl p-3 text-center`}>
               <h4 className="font-bold text-sm">{tier.label}</h4>
               <p className="text-[10px] opacity-70">{tier.desc}</p>
            </div>
         ))}
      </div>
    </div>
  );
};

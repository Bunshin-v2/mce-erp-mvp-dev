import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { User, Mail, Shield, Bell, Moon, Sun, Monitor, Save, LogOut } from 'lucide-react';

import { PageHeader } from '../ui/PageHeader';

export const ProfilePage: React.FC = () => {

    const { user } = useUser();
    const { signOut } = useClerk();
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [notifications, setNotifications] = useState({
        marketing: false,
        security: true,
        updates: true
    });

    const handleSave = () => {
        // Mock save
        alert('Settings saved (Simulation)');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader 
                title="User Profile"
                subtitle="Identity & Access Governance"
                actions={
                    <button
                        onClick={() => signOut()}
                        className="flex items-center space-x-2 px-6 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700 font-bold italic text-[10px] tracking-widest"
                    >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                    </button>
                }
            />


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Identity Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-[var(--surface-elevated)] border border-[var(--surface-border)] rounded-xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-critical)]"></div>
                        <img
                            src={user?.imageUrl}
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-zinc-800 mb-4 shadow-xl"
                        />
                        <h2 className="text-xl font-bold italic text-white">{user?.fullName || 'User Name'}</h2>
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded mt-2">{user?.id}</span>

                        <div className="mt-6 w-full space-y-3">
                            <div className="flex items-center space-x-3 text-sm text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                <Mail size={16} />
                                <span className="truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                <Shield size={16} />
                                <span>Role: Administrator</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="md:col-span-2 space-y-6">
                    {/* Preferences */}
                    <div className="bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold italic text-white mb-6 flex items-center">
                            <Monitor className="mr-2 text-zinc-500" size={20} />
                            Interface Settings
                        </h3>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                                <Sun size={24} />
                                <span className="text-xs font-bold italic">Light</span>
                            </button>
                            <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'bg-zinc-950 text-white border-zinc-500' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                                <Moon size={24} />
                                <span className="text-xs font-bold italic">Dark</span>
                            </button>
                            <button onClick={() => setTheme('system')} className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'system' ? 'bg-blue-600/10 text-blue-400 border-blue-500' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                                <Monitor size={24} />
                                <span className="text-xs font-bold italic">System</span>
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold italic text-white mb-6 flex items-center">
                            <Bell className="mr-2 text-zinc-500" size={20} />
                            Notifications
                        </h3>

                        <div className="space-y-4">
                            {[
                                { id: 'marketing', label: 'Marketing Updates', desc: 'Receive news about product features' },
                                { id: 'security', label: 'Security Alerts', desc: 'Critical security notifications' },
                                { id: 'updates', label: 'System Status', desc: 'Maintenance and downtime alerts' }
                            ].map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 hover:bg-zinc-900/50 rounded-lg transition-colors">
                                    <div>
                                        <p className="text-sm font-bold italic text-zinc-300">{item.label}</p>
                                        <p className="text-xs text-zinc-500">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications[item.id as keyof typeof notifications] ? 'bg-[var(--color-critical)]' : 'bg-zinc-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.id as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button onClick={handleSave} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-bold italic text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                <Save size={16} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


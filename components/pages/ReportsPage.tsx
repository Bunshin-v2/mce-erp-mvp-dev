import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, Zap, TrendingUp, Calendar, ChevronDown, Database, Globe, Clock, BarChart3, CheckCircle2 } from 'lucide-react';
import { safeExportToCSV, exportToHTML } from '../../utils/exportUtils';
import { useReports, ReportProfile, ReportSource } from '../../hooks/useReports';
import { PageHeader } from '../ui/PageHeader';
import { Box, Text, Card, Button } from '../../components/primitives';
import { cn } from '@/lib/utils';

export const ReportsPage: React.FC = () => {
  const [source, setSource] = useState<ReportSource>('PROJECTS');
  const [profile, setProfile] = useState<ReportProfile>('Executive');
  const [groupBy, setGroupBy] = useState<'Platform' | 'Location' | 'Day' | undefined>(undefined);

  const { data, isLoading } = useReports({ source, profile, groupBy });

  const reportProfiles: { id: ReportProfile; label: string; icon: any; desc: string; color: string }[] = [
    { id: 'Executive', label: 'Executive Summary', icon: TrendingUp, desc: 'Overview of key metrics and health', color: 'from-blue-600 to-blue-500' },
    { id: 'Standard', label: 'Standard Breakdown', icon: BarChart3, desc: 'Detailed operational breakdown', color: 'from-emerald-600 to-emerald-500' },
    { id: 'Depth', label: 'Depth Analysis', icon: Zap, desc: 'Technical deep dive analysis', color: 'from-violet-600 to-violet-500' },
    { id: 'Audit', label: 'Compliance Audit', icon: Calendar, desc: 'Full audit trail and validation', color: 'from-amber-600 to-amber-500' },
  ];

  const handleExport = (format: 'CSV' | 'HTML') => {
    if (!data) return;
    const exportData = Array.isArray(data) ? data : Object.values(data).flat();
    const filename = `MCE_${source}_${profile}_REPORT`;

    if (format === 'CSV') {
      safeExportToCSV(exportData, filename);
    } else {
      exportToHTML(exportData, filename, { source, profile });
    }
  };

  const renderTableHeaders = () => {
    if (!data || isLoading) return null;

    const firstItem = Array.isArray(data) ? data[0] : Object.values(data).flat()[0];
    if (!firstItem) return null;

    const headers = Object.keys(firstItem).filter(k => k !== '_audit' && k !== 'id');

    return (
      <Box
        as={motion.div}
        className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {headers.map((h, i) => (
          <Box key={h} className={`${i === 0 ? 'col-span-4' : 'col-span-2'} ${i === headers.length - 1 ? 'text-right' : ''}`}>
            <Text variant="label" className="text-[var(--text-secondary)] font-black italic uppercase tracking-widest text-[10px]">
              {h.replace(/_/g, ' ')}
            </Text>
          </Box>
        ))}
      </Box>
    );
  };

  const renderRows = (items: any[]) => {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.05 }
          }
        }}
      >
        {items.map((item, idx) => {
          const values = Object.entries(item).filter(([k]) => k !== '_audit' && k !== 'id');
          return (
            <Box
              as={motion.div}
              key={idx}
              className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-[var(--bg-hover)] cursor-pointer group transition-colors border-b border-[var(--border-subtle)]"
              variants={{
                hidden: { opacity: 0, y: 4 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
              }}
            >
              {values.map(([key, val], i) => (
                <Box key={key} className={`${i === 0 ? 'col-span-4' : 'col-span-2'} ${i === values.length - 1 ? 'text-right' : ''}`}>
                  <Text
                    className={cn(
                      "transition-colors group-hover:text-white",
                      i === 0 ? "text-white font-bold italic tracking-wide" : "text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-tertiary)] font-mono"
                    )}
                    variant="body"
                  >
                    {String(val)}
                  </Text>
                </Box>
              ))}
            </Box>
          );
        })}
      </motion.div>
    );
  };

  const renderGroupedData = () => {
    if (!data || isLoading || Array.isArray(data)) return null;

    return Object.entries(data as Record<string, any[]>).map(([groupName, items]) => (
      <Box
        as={motion.div}
        key={groupName}
        className="border-b border-[var(--border-subtle)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box className="px-4 py-2.5 bg-[var(--bg-surface)] flex items-center gap-3 border-b border-[var(--border-subtle)]">
          <ChevronDown size={14} className="text-[var(--text-secondary)]" />
          <Text variant="h4" className="text-[var(--text-primary)] font-black italic uppercase tracking-widest">{groupName}</Text>
          <Text variant="caption" className="ml-auto font-bold italic text-[10px] tracking-wider uppercase">{items.length} items</Text>
        </Box>
        <Box className="bg-[var(--bg-base)]">
          {renderRows(items)}
        </Box>
      </Box>
    ));
  };


  const renderAuditHierarchy = () => {
    if (!data || isLoading || profile !== 'Audit' || groupBy) return null;

    // Render Platform -> Location -> Day
    return Object.entries(data).map(([platform, locations]: [string, any]) => (
      <div key={platform} className="border-b border-[var(--border-subtle)]">
        <div className="px-4 py-2 bg-[var(--bg-surface)] flex items-center gap-3">
          <Database size={12} className="text-emerald-500" />
          <Text variant="h4" className="text-[var(--text-primary)]">{platform}</Text>
          <Text variant="caption" className="ml-auto font-bold italic text-[var(--text-tertiary)]">Platform</Text>
        </div>
        {Object.entries(locations).map(([location, days]: [string, any]) => (
          <div key={location} className="border-l border-emerald-500/20 ml-4">
            <div className="px-4 py-1.5 bg-[var(--bg-base)] flex items-center gap-3 border-b border-[var(--border-subtle)]">
              <Globe size={10} className="text-[var(--text-secondary)]" />
              <Text variant="body" className="font-bold italic text-[var(--text-secondary)]">{location}</Text>
              <Text variant="caption" className="ml-auto font-bold italic text-[var(--text-tertiary)]">Location</Text>
            </div>
            {Object.entries(days).map(([day, items]: [string, any]) => (
              <div key={day} className="border-l border-[var(--border-subtle)] ml-4">
                <div className="px-4 py-1.5 bg-black/10 flex items-center gap-3 border-b border-[var(--border-subtle)]">
                  <Clock size={8} className="text-[var(--text-tertiary)]" />
                  <Text variant="caption" className="font-bold italic text-[var(--text-secondary)]">{day}</Text>
                  <Text variant="caption" className="ml-auto font-bold italic text-[var(--text-tertiary)]">Date</Text>
                </div>
                <div>
                  {renderRows(items)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <Box className="page-container space-y-6 animate-in fade-in duration-700 pb-32">
      <PageHeader
        title="Reports"
        subtitle="Data Vault"
        actions={
          <Box className="flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 shadow-sm backdrop-blur-xl">
            {/* 1. Source Selector */}
            <Box
              className="flex bg-[var(--bg-input)] p-0.5 rounded border border-[var(--border-subtle)] gap-0.5"
            >
              {(['PROJECTS', 'TENDERS', 'FINANCIALS'] as ReportSource[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`px-3 py-1.5 text-[10px] font-black italic uppercase tracking-widest rounded transition-all ${source === s ? 'bg-[var(--bg-active)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'}`}
                >
                  {s}
                </button>
              ))}
            </Box>

            <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-1" />

            {/* 2. Group By Controls */}
            {profile !== 'Audit' && (
              <div className="flex gap-1.5">
                {(['Platform', 'Location', 'Day'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGroupBy(groupBy === g ? undefined : g)}
                    className={`px-2 py-1.5 text-[10px] font-black italic uppercase tracking-widest rounded-md transition-all border ${groupBy === g ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-1" />

            {/* 3. Search Field */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" size={12} />
              <input
                placeholder="Search records..."
                className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-md pl-7 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 w-48 transition-colors"
              />
            </div>

            <div className="h-4 w-[1px] bg-[var(--border-subtle)] mx-1" />

            {/* 4. Export Controls */}
            <Box className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-md border border-white/5">
              <Button
                as={motion.button}
                variant="primary"
                size="xs"
                onClick={() => handleExport('HTML')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-md hover:shadow-lg px-3 py-1.5 font-bold italic uppercase tracking-wider text-[10px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                leftIcon={<TrendingUp size={12} />}
              >
                Intelligence Report
              </Button>
              <Button
                as={motion.button}
                variant="outline"
                size="xs"
                onClick={() => handleExport('CSV')}
                className="border-white/10 hover:bg-white/5 px-3 py-1.5 font-bold italic uppercase tracking-wider text-[10px] text-zinc-400"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                leftIcon={<Download size={12} />}
              >
                Raw CSV
              </Button>
            </Box>
          </Box>
        }
      />

      {/* PROFILE SELECTOR - Using Configurable Cards */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {reportProfiles.map(p => (
          <Card
            as={motion.button}
            key={p.id}
            onClick={() => { setProfile(p.id); setGroupBy(undefined); }}
            variant="glass"
            className={`relative transition-all text-left flex flex-col gap-3 group p-4 ${profile === p.id
              ? `border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]`
              : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:shadow-lg'
              }`}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${p.color}`} />

            <Box className="relative z-10 flex items-start justify-between w-full">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all backdrop-blur-sm ${profile === p.id
                ? `bg-gradient-to-br ${p.color} border-white/20 text-white`
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] group-hover:text-white'
                }`}>
                <p.icon size={14} strokeWidth={1.5} />
              </div>
              {profile === p.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                />
              )}
            </Box>

            <Box className="relative z-10">
              <Text variant="h4" className={`text-sm font-black italic uppercase tracking-wide transition-colors ${profile === p.id ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-white'}`}>{p.label}</Text>
              <Text variant="caption" className="text-[10px] text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors leading-tight font-medium">{p.desc}</Text>
            </Box>
          </Card>
        ))}
      </Box>

      {/* DATA ENGINE OUTPUT */}
      <Card variant="glass" className="min-h-[400px] flex flex-col" padding="none">
        <Box className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex justify-between items-center">
          <Box className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
            />
            <Text variant="h5" className="text-white font-black italic uppercase tracking-widest text-sm">
              {source} Report
            </Text>
            <Text variant="caption" className="ml-2 font-bold italic text-xs">
              {Array.isArray(data) ? data.length : Object.values(data || {}).flat().length} records
            </Text>
          </Box>
        </Box>

        {isLoading ? (
          <Box className="flex-1 flex flex-col items-center justify-center space-y-4 py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Zap size={24} className="text-blue-500" />
            </motion.div>
            <Text variant="body" className="text-[var(--text-secondary)]">Generating report...</Text>
          </Box>
        ) : (
          <Box className="flex-1 flex flex-col">
            {renderTableHeaders()}
            <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
              {profile === 'Audit' && !groupBy ? renderAuditHierarchy() : (
                groupBy ? renderGroupedData() : renderRows(data || [])
              )}
              {(!data || (Array.isArray(data) && data.length === 0)) && (
                <div className="py-20 text-center flex flex-col items-center opacity-60">
                  <Database size={32} className="mb-4 text-zinc-600" />
                  <Text variant="h4" className="text-[var(--text-secondary)]">No records found</Text>
                  <Text variant="caption" className="mt-2">Try adjusting your filters or profile</Text>
                </div>
              )}
            </div>
          </Box>
        )}
      </Card>

      {/* Report Footer */}
      <Box
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-4 pb-4 flex justify-between items-center border-t border-[var(--border-subtle)] mt-2"
      >
        <Text variant="caption" className="font-bold italic text-xs">
          Report generated {new Date().toLocaleDateString()} • {source.toLowerCase()}
        </Text>
        <Box className="flex items-center gap-2">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <Text variant="caption" className="text-xs">Report ready</Text>
        </Box>
      </Box>
    </Box>
  );
};

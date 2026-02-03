import React, { useState, useMemo } from 'react';
import { Building2, MapPin, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Activity, AlertTriangle, Calendar, DollarSign, FileText, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { Box, Text, Card } from '@/components/primitives';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface ProjectListProps {
  projects: any[];
  onSelectProject: (id: string | null) => void;
  limit?: number;
}

type SortKey = 'project_name' | 'completion_percent' | 'contract_value_excl_vat' | 'project_status' | 'project_completion_date_planned';

// Verified: Production Ready
export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, limit }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'project_completion_date_planned', direction: 'asc' });

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Special handling for date-based countdown sorting
      if (sortConfig.key === 'project_completion_date_planned') {
        const aDate = aValue ? new Date(aValue).getTime() : Infinity;
        const bDate = bValue ? new Date(bValue).getTime() : Infinity;
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      if ((aValue || 0) < (bValue || 0)) return sortConfig.direction === 'asc' ? -1 : 1;
      if ((aValue || 0) > (bValue || 0)) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortConfig]);

  return (
    <Box className="w-full flex flex-col motion-entry">
      <Box className="grid grid-cols-12 gap-4 px-6 py-4 morgan-ledger-header border-b border-white/10">
        <Box className="col-span-1">
          <Text className="text-[10px] uppercase font-oswald font-black italic tracking-widest text-white">ID</Text>
        </Box>
        <Box className="col-span-4" >
          <Text className="text-[10px] uppercase font-oswald font-black italic tracking-widest text-white">Artifact Focus</Text>
        </Box>
        <Box className="col-span-2 text-center" >
          <Text className="text-[10px] uppercase font-oswald font-black italic tracking-widest text-white">Timeline</Text>
        </Box>
        <Box className="col-span-3" >
          <Text className="text-[10px] uppercase font-oswald font-black italic tracking-widest text-white">Status</Text>
        </Box>
        <Box className="col-span-2 text-right" >
          <Text className="text-[10px] uppercase font-oswald font-black italic tracking-widest text-white">Value</Text>
        </Box>
      </Box>

      {/* Rows */}
      <motion.div
        className="space-y-4 px-2 mt-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1
            }
          }
        }}
      >
        {(limit ? sortedProjects.slice(0, limit) : sortedProjects).map((project, index) => {
          const daysLeft = project.project_completion_date_planned
            ? Math.ceil((new Date(project.project_completion_date_planned).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;

          // Calculate Duration if dates exist
          let durationMonths = null;
          if (project.project_commencement_date && project.project_completion_date_planned) {
            const start = new Date(project.project_commencement_date);
            const end = new Date(project.project_completion_date_planned);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            durationMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
          }

          return (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
              }}
            >
              <Card
                onClick={() => onSelectProject(project.id)}
                variant="hover"
                padding="none"
                className="group grid grid-cols-12 gap-4 px-6 py-5 bg-white/[0.02] border-b border-border-subtle rounded-none hover:bg-[var(--bg-active)] items-center relative transition-all"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--morgan-teal)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Col 0: Index */}
                <Box className="col-span-1 flex items-center">
                  <Text className="text-[10px] font-mono font-bold text-[var(--text-tertiary)] opacity-60">
                    {(index + 1).toString().padStart(2, '0')}
                  </Text>
                </Box>

                {/* Col 1: Identification */}
                <Box className="col-span-4 flex items-center space-x-4 relative">
                  <Box className="w-9 h-9 bg-bg-surface border border-border-subtle rounded flex items-center justify-center text-text-secondary group-hover:text-emerald-500 transition-all">
                    <Building2 size={14} strokeWidth={1.5} />
                  </Box>
                  <Box className="min-w-0 flex flex-col gap-0.5 relative">
                    <Text className="truncate text-[12px] font-oswald font-bold italic text-[var(--text-primary)] uppercase tracking-[0.12em] group-hover:text-[var(--morgan-teal)] transition-colors">
                      {project.project_name}
                    </Text>

                    <Box className="flex items-center gap-2">
                      <Text variant="gov-label" color="tertiary" className="truncate text-[10px] text-text-secondary">
                        {project.client_name || 'Internal Protocol'}
                      </Text>
                      {project.project_code && (
                        <Text variant="gov-label" color="tertiary" className="text-[9px] px-1 border border-border-subtle rounded-sm bg-bg-base text-text-tertiary">
                          {project.project_code}
                        </Text>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Col 2: Timeline */}
                <Box className="col-span-2 text-center">
                  <Box className="inline-flex flex-col items-center">
                    <Text
                      variant="gov-metric"
                      className={`text-[13px] font-black ${daysLeft !== null && daysLeft < 30 ? 'text-rose-600 animate-pulse' : 'text-emerald-500'}`}
                    >
                      {daysLeft !== null ? (daysLeft < 0 ? `-${Math.abs(daysLeft)}D` : `${daysLeft}D`) : '--'}
                    </Text>
                    <Text variant="gov-label" color="tertiary" className="text-[9px] mt-0.5">Countdown</Text>
                  </Box>
                </Box>

                {/* Col 3: Status */}
                <Box className="col-span-3 px-2">
                  <Box className="flex flex-col gap-1.5">
                    <Box className="flex justify-between items-end">
                      <Text variant="gov-label" className="text-[10px]">Operational Phase</Text>
                      <Text variant="gov-metric" className="text-[10px]">{project.completion_percent || 0}%</Text>
                    </Box>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
                        style={{
                          width: `${project.completion_percent || 0}%`,
                          backgroundColor: (project.completion_percent || 0) >= 75 ? '#10b981' : (project.completion_percent || 0) >= 45 ? '#f59e0b' : '#ef4444',
                          opacity: 0.8
                        }}
                      ></div>
                    </div>
                  </Box>
                </Box>

                {/* Col 4: Value */}
                <Box className="col-span-2 text-right">
                  <Box className="flex flex-col items-end gap-1">
                    <Box className="flex items-baseline gap-1">
                      <Text className="text-[9px] font-bold italic text-[var(--text-tertiary)] opacity-60">AED</Text>
                      <Text className="text-[12px] font-oswald font-bold italic text-[var(--morgan-teal)]">
                        {(project.contract_value_excl_vat || 0).toLocaleString()}
                      </Text>
                    </Box>
                    <Text className={`px-2 py-0.5 rounded-sm text-[9px] font-bold font-oswald italic tracking-widest ${project.project_status?.includes('Construction') ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--bg-base)] text-[var(--text-tertiary)]'}`}>
                      {project.project_status || 'Active'}
                    </Text>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </Box >
  );
};

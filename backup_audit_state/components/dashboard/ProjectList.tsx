import React, { useState, useMemo } from 'react';
import { Building2, MapPin, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, Activity, AlertTriangle, Calendar, DollarSign, FileText, Hash } from 'lucide-react';

interface ProjectListProps {
  projects: any[];
  onSelectProject: (id: string | null) => void;
}

type SortKey = 'project_name' | 'completion_percent' | 'contract_value_excl_vat' | 'project_status' | 'project_completion_date_planned';

// Verified: Production Ready
export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject }) => {
  const [filter, setFilter] = useState<'ONGOING' | 'COMPLETED' | 'UPCOMING'>('ONGOING');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'project_completion_date_planned', direction: 'asc' });

  // Enterprise Sorting Logic
  const sortedAndFiltered = useMemo(() => {
    let data = projects.filter(p => {
      const status = p.project_status?.toUpperCase() || '';
      if (filter === 'ONGOING') return status.includes('CONSTRUCTION') || status.includes('ONGOING') || status.includes('ACTIVE');
      if (filter === 'COMPLETED') return status.includes('COMPLETED') || status.includes('DLP');
      if (filter === 'UPCOMING') return status.includes('TENDER') || status.includes('PRE-AWARD');
      return true;
    });

    return data.sort((a, b) => {
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
  }, [projects, filter, sortConfig]);

  return (
    <div className="w-full flex flex-col motion-entry">

      {/* Column Headers */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-sans opacity-50">
        <div className="col-span-5">Project Focus</div>
        <div className="col-span-2 text-center">Countdown</div>
        <div className="col-span-3">Execution Status</div>
        <div className="col-span-2 text-right">Value</div>
      </div>

      {/* Rows */}
      <div className="space-y-1.5 px-2 mt-4">
        {sortedAndFiltered.map((project) => {
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
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group grid grid-cols-12 gap-4 px-6 py-5 bg-white/[0.01] border border-white/[0.03] rounded-xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 cursor-pointer items-center relative hover:z-[100]"
            >
              <div className="absolute left-0 inset-y-0 w-0.5 bg-[#00dc82] opacity-0 group-hover:opacity-100 transition-all rounded-l-xl"></div>

              {/* Col 1: Identification */}
              <div className="col-span-5 flex items-center space-x-4 relative">
                <div className="w-10 h-10 bg-white/[0.02] border border-white/[0.05] rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-white transition-all">
                  <Building2 size={16} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex flex-col gap-1.5 relative group/tooltip">
                  <h4 className="text-[13px] font-bold text-white truncate tracking-tight group-hover:text-[#00dc82] transition-colors font-sans leading-none cursor-help">
                    {project.project_name}
                  </h4>

                  {/* Elite Hover Intel Card - Smooth & Subtle Refinement */}
                  <div className="absolute left-[calc(100%+1.5rem)] top-1/2 -translate-y-1/2 w-[340px] z-[999] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 ease-out hidden md:block pl-2">
                    {/* Connection Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-gradient-to-r from-emerald-500/50 to-transparent"></div>

                    <div className="bg-[#09090b]/95 border border-white/5 rounded-xl shadow-2xl backdrop-blur-3xl overflow-hidden relative">

                      {/* 1. Identity & Strategy (Header) - Name Removed (Redundant) */}
                      {/* 1. Identity & Strategy (Header) - RESTORED per user request */}
                      <div className="p-4 border-b border-white/5 bg-white/[0.02] space-y-3">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Project Name</span>
                          <h4 className="text-[13px] font-bold text-white leading-tight">{project.project_name}</h4>
                        </div>

                        {(project.client_name || project.project_code) && (
                          <div className="grid grid-cols-2 gap-4">
                            {project.client_name && project.client_name !== 'N/A' && project.client_name !== '-' && (
                              <div>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Client</span>
                                <p className="text-[11px] text-zinc-300 font-medium truncate">{project.client_name}</p>
                              </div>
                            )}
                            {project.project_code && project.project_code !== 'N/A' && project.project_code !== '-' && (
                              <div>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Code</span>
                                <p className="text-[11px] font-mono text-emerald-500 font-medium">{project.project_code}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. Key Data Grid (Location, Type) - Value & Status Removed (Redundant) */}
                      {((project.project_location_city && project.project_location_city !== 'TBD') || (project.project_type && project.project_type !== 'General')) && (
                        <div className="grid grid-cols-2 border-b border-white/5 divide-x divide-white/5">
                          <div className="p-3 space-y-3 col-span-2 flex gap-4">
                            {project.project_location_city && project.project_location_city !== 'TBD' && project.project_location_city !== 'N/A' && (
                              <div className="flex-1">
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5 mb-0.5"><MapPin size={9} /> Location</span>
                                <p className="text-[10px] text-zinc-300 font-medium truncate">{project.project_location_city}</p>
                              </div>
                            )}
                            {project.project_type && project.project_type !== 'General' && project.project_type !== 'N/A' && (
                              <div className="flex-1">
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5 mb-0.5"><Hash size={9} /> Type</span>
                                <p className="text-[10px] text-zinc-300 font-medium truncate">{project.project_type}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 3. Timeline & Execution - Only Explicit Dates (Comp % Removed Previously) */}
                      <div className="bg-white/[0.02] px-4 py-3 border-b border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={10} /> Execution Window
                          </span>
                          {durationMonths && (
                            <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              ~{durationMonths} Months
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between">
                          {project.project_commencement_date && (
                            <div>
                              <span className="text-[8px] text-zinc-600 block">Commencement</span>
                              <span className="text-[9px] text-zinc-400 font-mono">{new Date(project.project_commencement_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {project.project_completion_date_planned && (
                            <div className="text-right">
                              <span className="text-[8px] text-zinc-600 block">Est. Completion</span>
                              <span className="text-[9px] text-zinc-400 font-mono">{new Date(project.project_completion_date_planned).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. Scope & Remarks */}
                      {(project.scope_of_services_enum || project.remarks) && (
                        <div className="p-4 space-y-3">
                          {project.scope_of_services_enum && (
                            <div>
                              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                <FileText size={10} /> Scope of Work
                              </span>
                              <p className="text-[10px] text-zinc-400 leading-relaxed font-medium line-clamp-2">
                                {project.scope_of_services_enum}
                              </p>
                            </div>
                          )}

                          {/* Remarks */}
                          {project.remarks && (
                            <div className="flex gap-2.5 items-start pt-2 border-t border-white/5">
                              <AlertTriangle size={12} className="text-amber-500/80 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-zinc-500 italic leading-snug">
                                "{project.remarks}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider truncate">
                      {project.client_name || 'Internal'}
                    </span>
                    {project.project_code && (
                      <span className="text-[8px] font-mono font-bold text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                        {project.project_code}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                      <span className="text-[7px] font-mono text-zinc-600">P:{project.id.slice(0, 4)}</span>
                      {project.client_entity_uid && (
                        <span className="text-[7px] font-mono text-zinc-600">C:{project.client_entity_uid.slice(0, 4)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2: Countdown */}
              <div className="col-span-2 text-center">
                <div className="inline-flex flex-col items-center">
                  <span className={`text-[14px] font-black tracking-tighter font-mono ${daysLeft !== null && daysLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-[#00dc82]'}`}>
                    {daysLeft !== null ? `${daysLeft}D` : '--'}
                  </span>
                  <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Remaining</p>
                </div>
              </div>

              {/* Col 3: Progress */}
              <div className="col-span-3 px-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Completion</span>
                    <span className="text-[10px] font-mono font-bold text-white">{project.completion_percent || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
                      style={{
                        width: `${project.completion_percent || 0}%`,
                        backgroundColor: (project.completion_percent || 0) >= 75 ? '#00dc82' : (project.completion_percent || 0) >= 45 ? '#f59e0b' : '#ef4444',
                        opacity: 0.9
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Col 4: Value */}
              <div className="col-span-2 text-right">
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[8px] font-bold text-zinc-600 uppercase">AED</span>
                    <span className="text-[12px] font-bold text-white font-mono tracking-tighter">
                      {(project.contract_value_excl_vat || 0).toLocaleString()}
                    </span>
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${project.project_status?.includes('Construction') ? 'text-[#00dc82]' : 'text-zinc-500'
                    }`}>
                    {project.project_status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
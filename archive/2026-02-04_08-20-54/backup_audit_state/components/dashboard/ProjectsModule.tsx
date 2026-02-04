import React, { useState } from 'react';
import { Project } from '../../types';
import { Badge } from '../ui/Badge';
import { Briefcase } from 'lucide-react';
import { Card } from '../ui/Card';

const projects: Project[] = [
  { id: '1', name: 'Skyline Tower Alpha', location: 'Singapore', status: 'Active', completion: 42, budget: '$450M', created_at: new Date().toISOString() },
  { id: '2', name: 'West Rails Infra', location: 'London', status: 'Risk', completion: 78, budget: '$1.2B', created_at: new Date().toISOString() },
  { id: '3', name: 'Eco-District Phase 2', location: 'Copenhagen', status: 'Active', completion: 12, budget: '$85M', created_at: new Date().toISOString() },
  { id: '4', name: 'Harbor Logistics Hub', location: 'Dubai', status: 'Delayed', completion: 94, budget: '$320M', created_at: new Date().toISOString() },
  { id: '5', name: 'North Sea Wind Farm', location: 'Rotterdam', status: 'Active', completion: 25, budget: '$600M', created_at: new Date().toISOString() },
];

type FilterType = 'All' | 'Active' | 'Risk' | 'Delayed';

export const ProjectsModule: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.status === activeFilter);

  const filters: FilterType[] = ['All', 'Active', 'Risk', 'Delayed'];

  return (
    <Card
      title="Critical Projects"
      icon={Briefcase}
      action={<button className="text-[9px] text-zinc-600 hover:text-zinc-300 font-black uppercase tracking-widest transition-colors">Executive Portfolio</button>}
    >
      {/* MCE Branded Filtering */}
      <div className="px-6 py-3 border-b border-zinc-800/50 bg-zinc-950/20 flex items-center space-x-2 overflow-x-auto">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all border ${activeFilter === filter
              ? 'bg-zinc-800 text-zinc-50 border-zinc-700'
              : 'bg-zinc-950/50 text-zinc-600 hover:text-zinc-400 border-zinc-800/50'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Project Matrix */}
      <div className="flex flex-col divide-y divide-zinc-800/30 max-h-[440px] overflow-y-auto custom-scrollbar">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id} className="px-6 py-5 hover:bg-zinc-800/20 transition-colors group cursor-pointer motion-entry">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-zinc-100 group-hover:text-zinc-50 transition-colors tracking-tight font-sans">{project.name}</h4>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest font-sans">{project.location}</p>
                </div>
                <Badge status={project.status}>{project.status}</Badge>
              </div>

              {/* Clinical Progress Tracking */}
              <div className="w-full bg-zinc-950 h-0.5 rounded-full overflow-hidden border border-zinc-800/50">
                <div
                  className={`h-full transition-all duration-1000 ${project.status === 'Active' ? 'bg-emerald-500/80' :
                      project.status === 'Risk' ? 'bg-[var(--color-critical)]' :
                        project.status === 'Delayed' ? 'bg-amber-500/80' :
                          'bg-zinc-800'
                    }`}
                  style={{ width: `${project.completion}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-zinc-700 font-bold uppercase tracking-widest font-mono">
                <span className="flex items-center">
                  <span className="w-1 h-1 rounded-full bg-zinc-800 mr-2"></span>
                  {project.completion}% COMPLETE
                </span>
                <span className="text-zinc-500">{project.budget}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-zinc-600 font-bold text-[10px] uppercase tracking-[0.3em] bg-zinc-950/20">
            [NULL-SET] / NO PROJECTS MATCHING SELECTION
          </div>
        )}
      </div>
    </Card>
  );
};

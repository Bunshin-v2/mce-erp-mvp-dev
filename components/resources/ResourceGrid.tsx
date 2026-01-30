'use client';

import React from 'react';
import { Mail, Briefcase, User } from 'lucide-react';
import { TeamMember } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ResourceGridProps {
  members: TeamMember[];
  onRefresh: () => void;
  onAdd: () => void;
}

export default function ResourceGrid({ members, onRefresh, onAdd }: ResourceGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id} variant="interactive" padding="none">
            <CardHeader className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500">
                  <User size={20} />
                </div>
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-[10px] font-mono text-zinc-500 tracking-widest">{member.role}</p>
                </div>
              </div>
              <Badge variant={member.is_active ? 'success' : 'outline'}>
                {member.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2 text-[11px] font-mono">
                {member.email && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Mail size={12} className="text-zinc-600" />
                    {member.email}
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Briefcase size={12} className="text-zinc-600" />
                    {member.department}
                  </div>
                )}
              </div>

              {member.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {member.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="bg-white/5 text-zinc-400 text-[9px] px-2 py-0.5 rounded border border-white/5 font-bold italic">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 4 && (
                    <span className="text-[9px] text-zinc-600 font-bold italic">+{member.skills.length - 4} MORE</span>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-bold italic text-zinc-600 tracking-widest">Target Utilization</span>
                <span className="text-xs font-bold italic text-emerald-500">{member.utilization_target_percent}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-24 text-zinc-500 text-sm">
          <p>No personnel nodes detected in the registry.</p>
        </div>
      )}
    </div>
  );
}

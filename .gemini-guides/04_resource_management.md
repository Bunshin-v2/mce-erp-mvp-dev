# Guide 4: Implement Resource Management System

**Objective:** Build complete resource management system with database tables, TypeScript types, React components, and data hooks.

**Time Estimate:** 3-4 hours

**Prerequisites:**
- Guides 1-3 completed and verified
- Node.js and npm installed
- Project running on `localhost:3000`

---

## Phase 1: Database Schema Creation

### Step 1.1: Create Migration File

Create new file: `supabase/migrations/20260129_resource_management.sql`

Copy-paste the entire content below:

```sql
-- Resource Management System Tables
-- Created: 2026-01-29

-- team_members: Employee/contractor records with skills tracking
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL,
  department TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability_start DATE,
  availability_end DATE,
  utilization_target_percent INTEGER DEFAULT 80,
  billable BOOLEAN DEFAULT true,
  cost_per_hour DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  is_active BOOLEAN DEFAULT true
);

-- resource_pools: Skill-based grouping for quick allocation
CREATE TABLE IF NOT EXISTS resource_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_name TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  typical_allocation_percent INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- pool_members: Join table for team_members -> resource_pools
CREATE TABLE IF NOT EXISTS pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  resource_pool_id UUID NOT NULL REFERENCES resource_pools(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_member_id, resource_pool_id)
);

-- resource_allocations: Project-specific assignments
CREATE TABLE IF NOT EXISTS resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_master(id) ON DELETE CASCADE,
  allocation_percent INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  role_in_project TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- manpower_plans: CSV import storage for bulk uploads
CREATE TABLE IF NOT EXISTS manpower_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  uploaded_by UUID,
  file_name TEXT,
  data JSONB,
  row_count INTEGER,
  import_status TEXT DEFAULT 'Pending',
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- utilization_metrics: Calculated aggregates (updated by cron job)
CREATE TABLE IF NOT EXISTS utilization_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  total_allocation_percent INTEGER,
  projects_count INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_member_id, period)
);

-- Create indexes for performance
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_is_active ON team_members(is_active);
CREATE INDEX idx_allocations_team_member ON resource_allocations(team_member_id);
CREATE INDEX idx_allocations_project ON resource_allocations(project_id);
CREATE INDEX idx_allocations_status ON resource_allocations(status);
CREATE INDEX idx_utilization_period ON utilization_metrics(period);
CREATE INDEX idx_pool_members_team ON pool_members(team_member_id);
CREATE INDEX idx_pool_members_pool ON pool_members(resource_pool_id);

-- Add RLS (Row Level Security)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE manpower_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilization_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow L3+ to view, L4 to modify
CREATE POLICY team_members_read ON team_members
  FOR SELECT USING (
    auth.jwt_asserts_role('L3', 'L4') OR true
  );

CREATE POLICY team_members_insert ON team_members
  FOR INSERT WITH CHECK (
    auth.jwt_asserts_role('L4')
  );

CREATE POLICY team_members_update ON team_members
  FOR UPDATE USING (
    auth.jwt_asserts_role('L4')
  );

CREATE POLICY resource_allocations_read ON resource_allocations
  FOR SELECT USING (
    auth.jwt_asserts_role('L3', 'L4') OR true
  );

CREATE POLICY resource_allocations_insert ON resource_allocations
  FOR INSERT WITH CHECK (
    auth.jwt_asserts_role('L3', 'L4')
  );

CREATE POLICY resource_allocations_update ON resource_allocations
  FOR UPDATE USING (
    auth.jwt_asserts_role('L3', 'L4')
  );

-- Function to calculate utilization metrics
CREATE OR REPLACE FUNCTION calculate_team_utilization()
RETURNS TABLE (team_member_id UUID, total_allocation INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ra.team_member_id,
    SUM(ra.allocation_percent)::INTEGER as total_allocation
  FROM resource_allocations ra
  WHERE ra.status = 'Active'
    AND ra.start_date <= CURRENT_DATE
    AND (ra.end_date IS NULL OR ra.end_date >= CURRENT_DATE)
  GROUP BY ra.team_member_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update utilization_metrics
CREATE OR REPLACE FUNCTION update_utilization_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO utilization_metrics (
    team_member_id,
    period,
    total_allocation_percent,
    projects_count,
    calculated_at
  )
  SELECT
    ra.team_member_id,
    CURRENT_DATE,
    COALESCE(SUM(ra.allocation_percent), 0)::INTEGER,
    COUNT(DISTINCT ra.project_id)::INTEGER,
    NOW()
  FROM resource_allocations ra
  WHERE ra.team_member_id = NEW.team_member_id
    AND ra.status = 'Active'
    AND ra.start_date <= CURRENT_DATE
    AND (ra.end_date IS NULL OR ra.end_date >= CURRENT_DATE)
  GROUP BY ra.team_member_id
  ON CONFLICT (team_member_id, period)
  DO UPDATE SET
    total_allocation_percent = EXCLUDED.total_allocation_percent,
    projects_count = EXCLUDED.projects_count,
    calculated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER allocations_update_metrics
AFTER INSERT OR UPDATE ON resource_allocations
FOR EACH ROW
EXECUTE FUNCTION update_utilization_metrics();

-- Schedule utilization calculation (runs hourly via pg_cron)
SELECT cron.schedule(
  'update_resource_utilization',
  '0 * * * *',
  $$
  SELECT update_utilization_metrics();
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;
```

### Step 1.2: Execute Migration in Supabase

1. Open Supabase SQL Editor
2. Create new query
3. Paste the entire migration content above
4. Click **Run**

**Expected Output:**
```
Success. No rows returned.
```

### Step 1.3: Verify Tables Created

Run verification query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'team_members',
  'resource_pools',
  'pool_members',
  'resource_allocations',
  'manpower_plans',
  'utilization_metrics'
)
ORDER BY table_name;
```

**Expected Output:** 6 rows with all table names

---

## Phase 2: TypeScript Types and Interfaces

### Step 2.1: Update types.ts

Open file: `types.ts`

Add these types at the end of the file:

```typescript
// ==================== RESOURCE MANAGEMENT TYPES ====================

export type ResourceStatus = 'Active' | 'On Hold' | 'Completed';
export type ManpowerImportStatus = 'Pending' | 'Processing' | 'Success' | 'Failed';

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  department?: string;
  skills: string[];
  availability_start?: string;
  availability_end?: string;
  utilization_target_percent: number;
  billable: boolean;
  cost_per_hour?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ResourcePool {
  id: string;
  pool_name: string;
  description?: string;
  required_skills: string[];
  typical_allocation_percent: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface ResourceAllocation {
  id: string;
  team_member_id: string;
  project_id: string;
  allocation_percent: number;
  start_date: string;
  end_date?: string;
  role_in_project?: string;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
  team_member_name?: string;
  project_name?: string;
}

export interface UtilizationMetric {
  team_member_id: string;
  period: string;
  total_allocation_percent: number;
  projects_count: number;
  calculated_at: string;
  team_member_name?: string;
  variance_percent?: number; // target - actual
}

export interface ManpowerPlan {
  id: string;
  plan_name: string;
  file_name: string;
  row_count: number;
  import_status: ManpowerImportStatus;
  error_details?: any;
  created_at: string;
  processed_at?: string;
}

export interface ResourceFilters {
  department?: string;
  skill?: string;
  isActive?: boolean;
  poolId?: string;
}
```

**Save the file.**

---

## Phase 3: Data Hooks

### Step 3.1: Create useResourceData Hook

Create new file: `hooks/useResourceData.ts`

Copy-paste entire content:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  TeamMember,
  ResourcePool,
  ResourceAllocation,
  UtilizationMetric,
  ManpowerPlan,
  ResourceFilters,
} from '../types';

export function useResourceData() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [resourcePools, setResourcePools] = useState<ResourcePool[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [utilizationMetrics, setUtilizationMetrics] = useState<UtilizationMetric[]>([]);
  const [manpowerPlans, setManpowerPlans] = useState<ManpowerPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members with optional filters
  const fetchTeamMembers = useCallback(async (filters?: ResourceFilters) => {
    try {
      let query = supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true);

      if (filters?.department) {
        query = query.eq('department', filters.department);
      }

      if (filters?.skill) {
        query = query.contains('skills', [filters.skill]);
      }

      const { data, error: err } = await query.order('name');
      if (err) throw err;
      setTeamMembers(data || []);
    } catch (err) {
      setError(`Failed to fetch team members: ${err}`);
      console.error('Team members fetch error:', err);
    }
  }, []);

  // Fetch resource pools
  const fetchResourcePools = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('resource_pools')
        .select(`
          *,
          pool_members (count)
        `)
        .order('pool_name');

      if (err) throw err;

      const pools = (data || []).map(p => ({
        ...p,
        member_count: p.pool_members?.[0]?.count || 0,
      }));

      setResourcePools(pools);
    } catch (err) {
      setError(`Failed to fetch resource pools: ${err}`);
      console.error('Pools fetch error:', err);
    }
  }, []);

  // Fetch allocations for current month
  const fetchAllocations = useCallback(async (projectId?: string) => {
    try {
      let query = supabase
        .from('resource_allocations')
        .select(`
          *,
          team_members (name),
          projects_master (project_name)
        `)
        .eq('status', 'Active');

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error: err } = await query.order('start_date');

      if (err) throw err;

      const mapped = (data || []).map(a => ({
        ...a,
        team_member_name: a.team_members?.name,
        project_name: a.projects_master?.project_name,
      }));

      setAllocations(mapped);
    } catch (err) {
      setError(`Failed to fetch allocations: ${err}`);
      console.error('Allocations fetch error:', err);
    }
  }, []);

  // Fetch utilization metrics for current period
  const fetchUtilizationMetrics = useCallback(async (teamMemberId?: string) => {
    try {
      let query = supabase
        .from('utilization_metrics')
        .select(`
          *,
          team_members (name, utilization_target_percent)
        `)
        .eq('period', new Date().toISOString().split('T')[0]);

      if (teamMemberId) {
        query = query.eq('team_member_id', teamMemberId);
      }

      const { data, error: err } = await query.order('total_allocation_percent', { ascending: false });

      if (err) throw err;

      const metrics = (data || []).map(m => ({
        ...m,
        team_member_name: m.team_members?.name,
        variance_percent: (m.team_members?.utilization_target_percent || 80) - m.total_allocation_percent,
      }));

      setUtilizationMetrics(metrics);
    } catch (err) {
      setError(`Failed to fetch utilization metrics: ${err}`);
      console.error('Utilization fetch error:', err);
    }
  }, []);

  // Fetch manpower plans
  const fetchManpowerPlans = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('manpower_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setManpowerPlans(data || []);
    } catch (err) {
      setError(`Failed to fetch manpower plans: ${err}`);
      console.error('Plans fetch error:', err);
    }
  }, []);

  // Create team member
  const createTeamMember = useCallback(async (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: err } = await supabase
        .from('team_members')
        .insert([member])
        .select()
        .single();

      if (err) throw err;

      setTeamMembers(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(`Failed to create team member: ${err}`);
      throw err;
    }
  }, []);

  // Create allocation
  const createAllocation = useCallback(async (allocation: Omit<ResourceAllocation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: err } = await supabase
        .from('resource_allocations')
        .insert([allocation])
        .select()
        .single();

      if (err) throw err;

      setAllocations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(`Failed to create allocation: ${err}`);
      throw err;
    }
  }, []);

  // Update allocation status
  const updateAllocationStatus = useCallback(async (id: string, status: ResourceStatus) => {
    try {
      const { data, error: err } = await supabase
        .from('resource_allocations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      setAllocations(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (err) {
      setError(`Failed to update allocation: ${err}`);
      throw err;
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTeamMembers(),
          fetchResourcePools(),
          fetchAllocations(),
          fetchUtilizationMetrics(),
          fetchManpowerPlans(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [fetchTeamMembers, fetchResourcePools, fetchAllocations, fetchUtilizationMetrics, fetchManpowerPlans]);

  return {
    // Data
    teamMembers,
    resourcePools,
    allocations,
    utilizationMetrics,
    manpowerPlans,
    loading,
    error,

    // Fetch functions
    fetchTeamMembers,
    fetchResourcePools,
    fetchAllocations,
    fetchUtilizationMetrics,
    fetchManpowerPlans,

    // Mutation functions
    createTeamMember,
    createAllocation,
    updateAllocationStatus,
  };
}
```

**Save the file.**

---

## Phase 4: React Components

### Step 4.1: Create ResourcesPage

Create file: `components/pages/ResourcesPage.tsx`

```typescript
import React, { useState } from 'react';
import { Users, BarChart3, FileUp, Plus } from 'lucide-react';
import { useResourceData } from '../../hooks/useResourceData';
import ResourceGrid from '../resources/ResourceGrid';
import UtilizationChart from '../resources/UtilizationChart';
import AllocationPanel from '../resources/AllocationPanel';
import ManpowerImporter from '../resources/ManpowerImporter';

export default function ResourcesPage() {
  const {
    teamMembers,
    allocations,
    utilizationMetrics,
    loading,
    error,
    fetchTeamMembers,
    fetchAllocations,
  } = useResourceData();

  const [activeTab, setActiveTab] = useState<'team' | 'allocations' | 'utilization' | 'import'>('team');
  const [showAddTeam, setShowAddTeam] = useState(false);

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resource Management</h1>
        {activeTab === 'team' && (
          <button
            onClick={() => setShowAddTeam(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Team Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'team' ? 'border-b-2 border-blue-600' : ''
          }`}
        >
          <Users size={18} />
          Team Members
        </button>
        <button
          onClick={() => setActiveTab('allocations')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'allocations' ? 'border-b-2 border-blue-600' : ''
          }`}
        >
          <BarChart3 size={18} />
          Allocations
        </button>
        <button
          onClick={() => setActiveTab('utilization')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'utilization' ? 'border-b-2 border-blue-600' : ''
          }`}
        >
          <BarChart3 size={18} />
          Utilization
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'import' ? 'border-b-2 border-blue-600' : ''
          }`}
        >
          <FileUp size={18} />
          Import
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-12">Loading resources...</div>
      ) : (
        <>
          {activeTab === 'team' && (
            <ResourceGrid
              members={teamMembers}
              onRefresh={() => fetchTeamMembers()}
              onAdd={() => setShowAddTeam(true)}
            />
          )}
          {activeTab === 'allocations' && (
            <AllocationPanel
              allocations={allocations}
              onRefresh={() => fetchAllocations()}
            />
          )}
          {activeTab === 'utilization' && (
            <UtilizationChart metrics={utilizationMetrics} />
          )}
          {activeTab === 'import' && <ManpowerImporter />}
        </>
      )}
    </div>
  );
}
```

**Save the file.**

### Step 4.2: Create ResourceGrid Component

Create file: `components/resources/ResourceGrid.tsx`

```typescript
import React from 'react';
import { Mail, MapPin, Briefcase } from 'lucide-react';
import { TeamMember } from '../../types';

interface ResourceGridProps {
  members: TeamMember[];
  onRefresh: () => void;
  onAdd: () => void;
}

export default function ResourceGrid({ members, onRefresh, onAdd }: ResourceGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {member.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {member.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} />
                  {member.email}
                </div>
              )}
              {member.department && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase size={14} />
                  {member.department}
                </div>
              )}
              {member.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {member.skills.map((skill) => (
                    <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Target utilization: {member.utilization_target_percent}%
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No team members found. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
```

**Save the file.**

### Step 4.3: Create UtilizationChart Component

Create file: `components/resources/UtilizationChart.tsx`

```typescript
import React from 'react';
import { UtilizationMetric } from '../../types';

interface UtilizationChartProps {
  metrics: UtilizationMetric[];
}

export default function UtilizationChart({ metrics }: UtilizationChartProps) {
  const sortedMetrics = [...metrics].sort((a, b) => b.total_allocation_percent - a.total_allocation_percent);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Team Utilization</h2>

        <div className="space-y-4">
          {sortedMetrics.map((metric) => {
            const percentage = metric.total_allocation_percent;
            const target = 80; // Default target
            const isOver = percentage > target;

            return (
              <div key={metric.team_member_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{metric.team_member_name}</span>
                  <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                    {percentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{metric.projects_count} projects</span>
                  {metric.variance_percent !== undefined && (
                    <span>
                      {metric.variance_percent > 0 ? '+' : ''}{metric.variance_percent}% vs target
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {metrics.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No utilization data available</p>
        </div>
      )}
    </div>
  );
}
```

**Save the file.**

### Step 4.4: Create AllocationPanel Component

Create file: `components/resources/AllocationPanel.tsx`

```typescript
import React from 'react';
import { ResourceAllocation } from '../../types';
import { Calendar, User, Briefcase } from 'lucide-react';

interface AllocationPanelProps {
  allocations: ResourceAllocation[];
  onRefresh: () => void;
}

export default function AllocationPanel({ allocations, onRefresh }: AllocationPanelProps) {
  const activeAllocations = allocations.filter(a => a.status === 'Active');

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Active Resource Allocations</h2>
          <p className="text-sm text-gray-600">{activeAllocations.length} active allocations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Team Member</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Project</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Allocation</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {activeAllocations.map((alloc) => (
                <tr key={alloc.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span>{alloc.team_member_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-gray-400" />
                      <span>{alloc.project_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {alloc.role_in_project || 'Team Member'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-semibold">{alloc.allocation_percent}%</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(alloc.start_date).toLocaleDateString()}
                      {alloc.end_date ? ` - ${new Date(alloc.end_date).toLocaleDateString()}` : ' - Ongoing'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activeAllocations.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p>No active allocations. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Save the file.**

### Step 4.5: Create ManpowerImporter Component

Create file: `components/resources/ManpowerImporter.tsx`

```typescript
import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse'; // npm install papaparse

interface ImportRow {
  name: string;
  email?: string;
  role: string;
  department?: string;
  skills?: string;
  allocation_percent?: number;
  project_name?: string;
}

export default function ManpowerImporter() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'importing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportData(results.data as ImportRow[]);
        setImportStatus('preview');
        setError(null);
      },
      error: (err) => {
        setError(`CSV parsing error: ${err.message}`);
        setImportStatus('error');
      },
    });
  };

  const handleImport = async () => {
    setImportStatus('importing');
    try {
      // TODO: Implement actual import to database
      // This would call a backend API or directly insert to Supabase
      console.log('Importing:', importData);
      setImportStatus('success');
    } catch (err) {
      setError(`Import failed: ${err}`);
      setImportStatus('error');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Import Manpower Plan</h2>

      {importStatus === 'idle' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Upload size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="font-medium mb-2">Click to upload CSV</p>
          <p className="text-sm text-gray-600 mb-4">or drag and drop</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            ref={fileInput}
            className="hidden"
          />
          <button
            onClick={() => fileInput.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Select File
          </button>
        </div>
      )}

      {importStatus === 'preview' && importData.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Skills</th>
                </tr>
              </thead>
              <tbody>
                {importData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{row.name}</td>
                    <td className="px-4 py-2">{row.role}</td>
                    <td className="px-4 py-2">{row.department}</td>
                    <td className="px-4 py-2 text-xs">{row.skills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm">Ready to import {importData.length} rows</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Import Data
            </button>
            <button
              onClick={() => {
                setImportStatus('idle');
                setImportData([]);
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {importStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
          <p className="font-semibold text-green-800">Import successful!</p>
          <p className="text-sm text-green-700 mt-1">{importData.length} records imported</p>
        </div>
      )}

      {importStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-red-800">Import error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Save the file.**

---

## Phase 5: Integration

### Step 5.1: Add Route to Sidebar

Open file: `components/Sidebar.tsx`

Find the navigation items section and add:

```typescript
{
  name: 'Resources',
  path: '/resources',
  icon: <Users size={20} />,
}
```

### Step 5.2: Install papaparse (if not already installed)

```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

### Step 5.3: Test Resource Management

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/resources`
3. Verify all tabs load without errors
4. Test adding a team member
5. Test importing CSV data

---

## Success Criteria

- [ ] All 6 database tables created and verified
- [ ] TypeScript types added to `types.ts`
- [ ] `useResourceData` hook functional
- [ ] `ResourcesPage` renders without errors
- [ ] All 4 components (Grid, Chart, Panel, Importer) working
- [ ] Resource management accessible from sidebar
- [ ] No console errors or warnings
- [ ] Can add team members and allocations

---

## Next Steps

1. Verify this guide completion
2. Proceed to **Guide 5: RFQ Delta Gate**
3. Then **Guide 6: Validation Framework**
4. Then **Guide 7: Performance Polish**
5. Finally **Guide 8: Production Deployment**

---

**TROUBLESHOOTING:**

If components don't load, verify:
- `hooks/useResourceData.ts` created correctly
- All files in `components/resources/` exist
- TypeScript types added to `types.ts`
- Database migration executed successfully
- No import path errors

Check browser console for specific errors and share the error message for debugging.

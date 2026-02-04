import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  TeamMember,
  ResourcePool,
  ResourceAllocation,
  UtilizationMetric,
  ManpowerPlan,
  ResourceFilters,
  ResourceStatus,
} from '../types';
import { logger } from '../lib/logger';

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
      let query = (supabase
        .from('team_members' as any) as any)
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
    } catch (err: any) {
      setError(`Failed to fetch team members: ${err.message}`);
      logger.error('TEAM_MEMBERS_FETCH_ERROR', err);
    }
  }, []);

  // Fetch resource pools
  const fetchResourcePools = useCallback(async () => {
    try {
      const { data, error: err } = await (supabase
        .from('resource_pools' as any) as any)
        .select(`
          *,
          pool_members (count)
        `)
        .order('pool_name');

      if (err) throw err;

      const pools = (data || []).map((p: any) => ({
        ...p,
        member_count: p.pool_members?.[0]?.count || 0,
      }));

      setResourcePools(pools);
    } catch (err: any) {
      setError(`Failed to fetch resource pools: ${err.message}`);
      logger.error('POOLS_FETCH_ERROR', err);
    }
  }, []);

  // Fetch allocations
  const fetchAllocations = useCallback(async (projectId?: string) => {
    try {
      let query = (supabase
        .from('resource_allocations' as any) as any)
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

      const mapped = (data || []).map((a: any) => ({
        ...a,
        team_member_name: a.team_members?.name,
        project_name: a.projects_master?.project_name,
      }));

      setAllocations(mapped);
    } catch (err: any) {
      setError(`Failed to fetch allocations: ${err.message}`);
      logger.error('ALLOCATIONS_FETCH_ERROR', err);
    }
  }, []);

  // Fetch utilization metrics for current period
  const fetchUtilizationMetrics = useCallback(async (teamMemberId?: string) => {
    try {
      let query = (supabase
        .from('utilization_metrics' as any) as any)
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

      const metrics = (data || []).map((m: any) => ({
        ...m,
        team_member_name: m.team_members?.name,
        variance_percent: (m.team_members?.utilization_target_percent || 80) - m.total_allocation_percent,
      }));

      setUtilizationMetrics(metrics);
    } catch (err: any) {
      setError(`Failed to fetch utilization metrics: ${err.message}`);
      logger.error('UTILIZATION_FETCH_ERROR', err);
    }
  }, []);

  // Fetch manpower plans
  const fetchManpowerPlans = useCallback(async () => {
    try {
      const { data, error: err } = await (supabase
        .from('manpower_plans' as any) as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setManpowerPlans(data || []);
    } catch (err: any) {
      setError(`Failed to fetch manpower plans: ${err.message}`);
      logger.error('PLANS_FETCH_ERROR', err);
    }
  }, []);

  // Create team member
  const createTeamMember = useCallback(async (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: err } = await (supabase
        .from('team_members' as any) as any)
        .insert([member])
        .select()
        .single();

      if (err) throw err;

      setTeamMembers(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(`Failed to create team member: ${err.message}`);
      throw err;
    }
  }, []);

  // Create allocation
  const createAllocation = useCallback(async (allocation: Omit<ResourceAllocation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: err } = await (supabase
        .from('resource_allocations' as any) as any)
        .insert([allocation])
        .select()
        .single();

      if (err) throw err;

      setAllocations(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(`Failed to create allocation: ${err.message}`);
      throw err;
    }
  }, []);

  // Update allocation status
  const updateAllocationStatus = useCallback(async (id: string, status: ResourceStatus) => {
    try {
      const { data, error: err } = await (supabase
        .from('resource_allocations' as any) as any)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      setAllocations(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (err: any) {
      setError(`Failed to update allocation: ${err.message}`);
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

import { SupabaseClient } from '@supabase/supabase-js';

export type AlertSeverity = 'CASUAL' | 'CRITICAL' | 'CATASTROPHIC';
export type AlertStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'SNOOZED' | 'MUTED' | 'DONE';

interface AlertTrigger {
  alert_id: string;
  due_at: Date;
  severity: AlertSeverity;
}

/**
 * Implements Step 5.2 of the Contract Parsing System Blueprint:
 * Trigger schedule: T-7, T-5, T-3, T-24h, T-12h, T-8h.
 */
export const calculateNextNotifyAt = (dueAt: string, severity: AlertSeverity, currentStatus: AlertStatus): Date | null => {
  if (currentStatus === 'DONE' || currentStatus === 'MUTED') return null;

  const now = new Date();
  const due = new Date(dueAt);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  // 1. Static T-Minus Schedule
  if (diffDays > 7) return new Date(due.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (diffDays > 5) return new Date(due.getTime() - 5 * 24 * 60 * 60 * 1000);
  if (diffDays > 3) return new Date(due.getTime() - 3 * 24 * 60 * 60 * 1000);
  if (diffHours > 24) return new Date(due.getTime() - 24 * 60 * 60 * 1000);
  if (diffHours > 12) return new Date(due.getTime() - 12 * 60 * 60 * 1000);
  if (diffHours > 8) return new Date(due.getTime() - 8 * 60 * 60 * 1000);

  // 2. Dynamic Nudges (T-72h to due)
  if (diffHours > 0) {
    const nudgeInterval = severity === 'CATASTROPHIC' ? 1 : 4; // 1h for catastrophic, 4h for critical
    return new Date(now.getTime() + nudgeInterval * 60 * 60 * 1000);
  }

  return null; // Past due
};

export const notificationEngine = {
  async createAlert(client: SupabaseClient, variableId: string, severity: AlertSeverity, dueAt: string) {
    const nextNotify = calculateNextNotifyAt(dueAt, severity, 'PENDING_REVIEW');

    const { data, error } = await client
      .from('alerts')
      .insert([{
        variable_id: variableId,
        severity,
        due_at: dueAt,
        status: 'PENDING_REVIEW',
        next_notify_at: nextNotify?.toISOString(),
        ack_required: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async acknowledgeAlert(client: SupabaseClient, alertId: string, profileId: string, action: 'DONE' | 'SNOOZE' | 'MUTE', note?: string) {
    const statusMap: Record<string, AlertStatus> = {
      'DONE': 'DONE',
      'SNOOZE': 'SNOOZED',
      'MUTE': 'MUTED'
    };

    const { data: alert } = await client.from('alerts').select('*').eq('id', alertId).single();
    if (!alert) return;

    const nextStatus = statusMap[action];
    const nextNotify = action === 'SNOOZE' ? calculateNextNotifyAt(alert.due_at, alert.severity, nextStatus) : null;

    // 1. Update Alert Status
    await client.from('alerts').update({
      status: nextStatus,
      next_notify_at: nextNotify?.toISOString(),
    }).eq('id', alertId);

    // 2. Log HITL Event
    await client.from('alert_events').insert([{
      alert_id: alertId,
      actor_profile_id: profileId,
      event_type: action,
      note: note || ''
    }]);
  },

  /**
   * Scans all active alarm rules and generates alerts for matching entities.
   * This should be called by a cron job or periodic background process.
   */
  async processRules(client: SupabaseClient) {
    const { data: rules } = await client.from('alarm_rules').select('*').eq('is_active', true);
    if (!rules) return;

    for (const rule of rules) {
      // 1. Determine Target Date Range
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + rule.condition_value); // e.g. Now + 14 days

      // 2. Query Entities Matching Condition
      // Assumes simple 'days_before' logic for MVP
      let query = client.from(rule.entity_type.toLowerCase() + 's').select('*');
      
      if (rule.condition_operator === 'Days Before') {
         // Find items due ON or BEFORE the target date (but not too far in past)
         query = query.lte(rule.condition_field, targetDate.toISOString())
                      .gt(rule.condition_field, new Date().toISOString()); 
      }

      const { data: entities } = await query;

      if (entities) {
        for (const entity of entities) {
           // Check if alert already exists to prevent spam
           const { count } = await client.from('alerts')
             .select('*', { count: 'exact', head: true })
             .eq('related_entity_id', entity.id)
             .eq('rule_id', rule.id)
             .eq('status', 'PENDING_REVIEW');

           if (!count) {
             await this.createAlert(client, entity.id, rule.severity || 'CASUAL', entity[rule.condition_field]);
           }
        }
      }
    }
  }
};

import type { Meta, StoryObj } from '@storybook/react';
import { UnifiedRiskCommand } from './UnifiedRiskCommand';

const meta: Meta<typeof UnifiedRiskCommand> = {
  title: 'Dashboard/UnifiedRiskCommand',
  component: UnifiedRiskCommand,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof UnifiedRiskCommand>;

export const SystemNominal: Story = {
  args: {
    riskDistribution: {
      critical: 0,
      high: 0,
      nominal: 12,
      stable: 26,
    },
    alerts: [],
    mode: 'compact',
  },
};

export const ElevatedRisk: Story = {
  args: {
    riskDistribution: {
      critical: 3,
      high: 5,
      nominal: 15,
      stable: 15,
    },
    alerts: [
      {
        id: '1',
        title: 'Al Barsha Tower - Budget Overrun Detected',
        severity: 'critical',
        timestamp: '2m ago',
        category: 'Financial',
      },
      {
        id: '2',
        title: 'Marina Heights - Delayed Milestone',
        severity: 'high',
        timestamp: '15m ago',
        category: 'Timeline',
      },
      {
        id: '3',
        title: 'Dubai Mall Extension - Resource Shortage',
        severity: 'high',
        timestamp: '1h ago',
        category: 'Resources',
      },
    ],
    mode: 'compact',
  },
};

export const CriticalState: Story = {
  args: {
    riskDistribution: {
      critical: 8,
      high: 12,
      nominal: 10,
      stable: 8,
    },
    alerts: [
      {
        id: '1',
        title: 'URGENT: Presidential Court Project - CEO Escalation',
        severity: 'critical',
        timestamp: 'Just now',
        category: 'Executive',
      },
      {
        id: '2',
        title: 'Al Barsha Tower - Critical Path Disruption',
        severity: 'critical',
        timestamp: '5m ago',
        category: 'Timeline',
      },
      {
        id: '3',
        title: 'Marina Heights - Material Shortage Crisis',
        severity: 'critical',
        timestamp: '12m ago',
        category: 'Supply Chain',
      },
      {
        id: '4',
        title: 'Dubai Mall Extension - Safety Incident Reported',
        severity: 'high',
        timestamp: '25m ago',
        category: 'Safety',
      },
      {
        id: '5',
        title: 'Jumeirah Residence - Quality Control Alert',
        severity: 'high',
        timestamp: '1h ago',
        category: 'Quality',
      },
    ],
    mode: 'expanded',
  },
};

export const LightMode: Story = {
  args: {
    riskDistribution: {
      critical: 2,
      high: 3,
      nominal: 18,
      stable: 15,
    },
    alerts: [
      {
        id: '1',
        title: 'Budget Review Required - Q2 Projects',
        severity: 'high',
        timestamp: '30m ago',
        category: 'Financial',
      },
    ],
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

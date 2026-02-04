import type { Meta, StoryObj } from '@storybook/react';
import { MetricTile } from './MetricTile';
import { Building2, DollarSign, AlertTriangle } from 'lucide-react';

const meta: Meta<typeof MetricTile> = {
  title: 'Dashboard/MetricTile',
  component: MetricTile,
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MetricTile>;

export const ActiveProjects: Story = {
  args: {
    metric: {
      label: 'ACTIVE PROJECTS',
      value: '38',
      trend: '',
      trendDirection: 'neutral',
      trendSentiment: 'neutral',
      description: 'NOMINAL — FULL PORTFOLIO',
    },
    color: 'blue',
    icon: Building2,
  },
};

export const PortfolioValue: Story = {
  args: {
    metric: {
      label: 'PORTFOLIO VALUE',
      value: '406.5M',
      trend: '',
      trendDirection: 'neutral',
      trendSentiment: 'neutral',
      description: 'VERIFIED — LEDGER VERIFIED',
      isCurrency: true,
    },
    color: 'emerald',
    icon: DollarSign,
  },
};

export const CriticalHazards: Story = {
  args: {
    metric: {
      label: 'CRITICAL HAZARDS',
      value: '1',
      trend: '',
      trendDirection: 'neutral',
      trendSentiment: 'negative',
      description: 'DIRECT ACTION',
      status: 'CRITICAL',
    },
    color: 'rose',
    icon: AlertTriangle,
  },
};

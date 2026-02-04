import type { Meta, StoryObj } from '@storybook/react';
import { MetricTile } from './MetricTile';

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
    label: 'ACTIVE PROJECTS',
    value: '38',
    subLabel: 'NOMINAL',
    subValue: 'FULL PORTFOLIO',
    subLabelColor: 'success',
    subValueColor: 'critical',
    icon: 'building',
  },
};

export const PortfolioValue: Story = {
  args: {
    label: 'PORTFOLIO VALUE',
    value: 'AED 406.5M',
    subLabel: 'VERIFIED',
    subValue: 'LEDGER VERIFIED',
    subLabelColor: 'verified',
    subValueColor: 'success',
    icon: 'dollar',
  },
};

export const CriticalHazards: Story = {
  args: {
    label: 'CRITICAL HAZARDS',
    value: '1',
    subLabel: 'CRITICAL',
    subValue: 'DIRECT ACTION',
    subLabelColor: 'critical',
    subValueColor: 'critical',
    icon: 'alert',
  },
};

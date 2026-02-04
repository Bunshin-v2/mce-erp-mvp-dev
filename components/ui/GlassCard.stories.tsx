import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from './GlassCard';

const meta: Meta<typeof GlassCard> = {
  title: 'UI/GlassCard',
  component: GlassCard,
};

export default meta;
type Story = StoryObj<typeof GlassCard>;

export const Base: Story = {
  args: {
    variant: 'base',
    children: <div className="p-4 text-[var(--text-primary)]">Base Glass Card</div>,
  },
};

export const Hover: Story = {
  args: {
    variant: 'hover',
    children: <div className="p-4 text-[var(--text-primary)]">Hover to see effect</div>,
  },
};

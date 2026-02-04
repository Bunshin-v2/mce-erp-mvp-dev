import type { Meta, StoryObj } from '@storybook/react';
import { OperationalLedger } from './OperationalLedger';

const meta: Meta<typeof OperationalLedger> = {
  title: 'Dashboard/OperationalLedger',
  component: OperationalLedger,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OperationalLedger>;

export const LightMode: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Operational Ledger in light mode showing project portfolio with Morgan System tokens',
      },
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Operational Ledger in dark mode for comparison',
      },
    },
  },
};

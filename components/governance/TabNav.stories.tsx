import type { Meta, StoryObj } from '@storybook/react';
import { TabNav } from './TabNav';

const meta: Meta<typeof TabNav> = {
  title: 'Governance/TabNav',
  component: TabNav,
};

export default meta;
type Story = StoryObj<typeof TabNav>;

export const LightMode: Story = {
  args: {
    tabs: [
      { id: 'ONGOING', label: 'Ongoing', count: 12 },
      { id: 'COMPLETED', label: 'Completed', count: 8 },
      { id: 'UPCOMING', label: 'Upcoming', count: 5 },
    ],
    activeTab: 'ONGOING',
    onChange: (id) => console.log('Tab changed:', id),
  },
};
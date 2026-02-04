import type { Meta, StoryObj } from '@storybook/react';
import { DeadlineTimeline } from './DeadlineTimeline';

const meta: Meta<typeof DeadlineTimeline> = {
  title: 'Dashboard/DeadlineTimeline',
  component: DeadlineTimeline,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DeadlineTimeline>;

const mockDeadlines = [
  {
    id: '1',
    title: 'SSMC STAFF PARKING PHASE I - Final Submission',
    dueDate: new Date(Date.now()).toISOString(),
    project: 'SSMC Infrastructure',
    priority: 'High' as const,
  },
  {
    id: '2',
    title: 'AL GHURAIR REHABILITATION CENTER - BOQ Review',
    dueDate: new Date(Date.now()).toISOString(),
    project: 'Al Ghurair Medical',
    priority: 'High' as const,
  },
  {
    id: '3',
    title: 'SSMC STAFF PARKING PHASE II - Technical Drawings',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'SSMC Infrastructure',
    priority: 'Medium' as const,
  },
  {
    id: '4',
    title: 'STMC MULTI-STOREY PARKING - Structural Analysis',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'STMC Development',
    priority: 'Medium' as const,
  },
  {
    id: '5',
    title: 'DUBAI MALL EXTENSION - MEP Coordination',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'Dubai Mall Phase 3',
    priority: 'Low' as const,
  },
  {
    id: '6',
    title: 'BURJ KHALIFA MAINTENANCE - Quarterly Inspection',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'Emaar Properties',
    priority: 'Low' as const,
  },
  {
    id: '7',
    title: 'PALM JUMEIRAH VILLAS - Final Handover',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    project: 'Nakheel Development',
    priority: 'Medium' as const,
  },
];

export const Default: Story = {
  args: {
    deadlines: mockDeadlines,
  },
};

export const UrgentOnly: Story = {
  args: {
    deadlines: mockDeadlines.slice(0, 3),
  },
};

export const Empty: Story = {
  args: {
    deadlines: [],
  },
};

export const LightMode: Story = {
  args: {
    deadlines: mockDeadlines,
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { DeadlineList } from './DeadlineList';

const meta: Meta<typeof DeadlineList> = {
  title: 'Dashboard/DeadlineList',
  component: DeadlineList,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DeadlineList>;

const mockTasks = [
  {
    id: '1',
    title: 'SSMC STAFF PARKING PHASE I - Final Submission',
    dueDate: new Date(Date.now()).toISOString(),
    priority: 'High' as const,
    assignedTo: 'Ahmed Khan',
    project: 'SSMC Infrastructure',
  },
  {
    id: '2',
    title: 'AL GHURAIR REHABILITATION CENTER - BOQ Review',
    dueDate: new Date(Date.now()).toISOString(),
    priority: 'High' as const,
    assignedTo: 'Maria Santos',
    project: 'Al Ghurair Medical',
  },
  {
    id: '3',
    title: 'SSMC STAFF PARKING PHASE II - Technical Drawings',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: 'Medium' as const,
    assignedTo: 'John Smith',
    project: 'SSMC Infrastructure',
  },
  {
    id: '4',
    title: 'STMC MULTI-STOREY PARKING - Structural Analysis',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    priority: 'Medium' as const,
    assignedTo: 'Sarah Ahmed',
    project: 'STMC Development',
  },
  {
    id: '5',
    title: 'DUBAI MALL EXTENSION - MEP Coordination',
    dueDate: new Date(Date.now() + 604800000).toISOString(),
    priority: 'Low' as const,
    assignedTo: 'Michael Chen',
    project: 'Dubai Mall Phase 3',
  },
];

export const Default: Story = {
  args: {
    tasks: mockTasks,
  },
};

export const Empty: Story = {
  args: {
    tasks: [],
  },
};

export const UrgentOnly: Story = {
  args: {
    tasks: mockTasks.slice(0, 2),
  },
};

export const LightMode: Story = {
  args: {
    tasks: mockTasks,
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

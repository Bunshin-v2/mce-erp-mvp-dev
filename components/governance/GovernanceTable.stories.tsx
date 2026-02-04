import type { Meta, StoryObj } from '@storybook/react';
import { GovernanceTable } from './GovernanceTable';

const meta: Meta<typeof GovernanceTable> = {
  title: 'Governance/GovernanceTable',
  component: GovernanceTable,
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GovernanceTable>;

export const LightMode: Story = {
  args: {
    data: [
      { id: '1', project_name: 'Al Barsha Tower', client_name: 'Emaar', delivery_risk_rating: 'Nominal' },
      { id: '2', project_name: 'Marina Heights', client_name: 'Nakheel', delivery_risk_rating: 'Critical' },
    ],
    columns: [
      { header: 'Project', accessor: 'project_name', width: '50%' },
      { header: 'Client', accessor: 'client_name', width: '30%' },
      { header: 'Risk', accessor: 'delivery_risk_rating', width: '20%' },
    ],
  },
};
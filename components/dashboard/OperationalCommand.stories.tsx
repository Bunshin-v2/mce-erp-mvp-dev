import type { Meta, StoryObj } from '@storybook/react';
import { OperationalCommand } from './OperationalCommand';

const meta: Meta<typeof OperationalCommand> = {
  title: 'Dashboard/OperationalCommand',
  component: OperationalCommand,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof OperationalCommand>;

const mockProjects = [
  {
    id: '1',
    project_name: 'MAJALIS PHASE 3 (NO 5) SUPERVISION',
    client_name: 'Presidential Court',
    project_code: 'PRJ-2024-001',
    project_completion_date_planned: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_risk_rating: 'Nominal',
    contract_value: 3500000,
    phase: 'Construction Ongoing',
  },
  {
    id: '2',
    project_name: 'MAJLIS (2) AL DHAFRA',
    client_name: 'Presidential Court',
    project_code: 'PRJ-2024-002',
    project_completion_date_planned: new Date(Date.now() + 57 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_risk_rating: 'Nominal',
    contract_value: 1700000,
    phase: 'Construction Ongoing',
  },
  {
    id: '3',
    project_name: 'AL KHEIRAN VILLA',
    client_name: 'Presidential Court',
    project_code: 'PRJ-2024-003',
    project_completion_date_planned: new Date(Date.now() + 57 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_risk_rating: 'Nominal',
    contract_value: 3300000,
    phase: 'Ongoing',
  },
  {
    id: '4',
    project_name: 'ARAB MONETARY FUND FITOUT & FAÇADE',
    client_name: 'Arab Monetary Fund',
    project_code: 'PRJ-2024-004',
    project_completion_date_planned: new Date(Date.now() + 87 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_risk_rating: 'High',
    contract_value: 2400000,
    phase: 'Construction Ongoing',
  },
  {
    id: '5',
    project_name: 'AD POLICE SAADIYAT D3',
    client_name: 'AD Police',
    project_code: 'PRJ-2024-005',
    project_completion_date_planned: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_risk_rating: 'Nominal',
    contract_value: 1200000,
    phase: 'Construction Ongoing',
  },
];

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
];

const mockTenders = [
  {
    id: '1',
    title: 'TAWAZUN INDUSTRIAL PARK',
    client: 'Tawazun Economic Council',
    value: 125000000,
    probability: 'High',
    status: 'Pre-Award',
  },
  {
    id: '2',
    title: 'ABU DHABI PLANT TISSUE CULTURE LAB',
    client: 'ADSSC',
    value: 45000000,
    probability: 'Medium',
    status: 'Tender Stage',
  },
  {
    id: '3',
    title: 'AGRICULTURAL GENOME BANK DESIGN',
    client: 'Ministry of Climate Change',
    value: 78000000,
    probability: 'High',
    status: 'Bidding',
  },
  {
    id: '4',
    title: 'THE FARM HOUSE COMMUNITY CENTER',
    client: 'Dubai Municipality',
    value: 32000000,
    probability: 'Medium',
    status: 'Proposal',
  },
];

export const Default: Story = {
  args: {
    projects: mockProjects,
    deadlines: mockDeadlines,
    tenders: mockTenders,
  },
};

export const LightMode: Story = {
  args: {
    projects: mockProjects,
    deadlines: mockDeadlines,
    tenders: mockTenders,
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

export const MinimalData: Story = {
  args: {
    projects: mockProjects.slice(0, 2),
    deadlines: mockDeadlines.slice(0, 2),
    tenders: mockTenders.slice(0, 2),
  },
};

export const Empty: Story = {
  args: {
    projects: [],
    deadlines: [],
    tenders: [],
  },
};

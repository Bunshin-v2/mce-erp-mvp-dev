import type { Meta, StoryObj } from '@storybook/react';
import { TendersModule } from './TendersModule';

const meta: Meta<typeof TendersModule> = {
  title: 'Dashboard/TendersModule',
  component: TendersModule,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof TendersModule>;

const mockTenders = [
  {
    id: '1',
    title: 'TAWAZUN INDUSTRIAL PARK',
    client: 'Tawazun Economic Council',
    status: 'Pre-Award',
    value: 125000000,
    probability: 'High',
    winProbability: 'High',
  },
  {
    id: '2',
    title: 'ABU DHABI PLANT TISSUE CULTURE LAB',
    client: 'ADSSC',
    status: 'Tender Stage',
    value: 45000000,
    probability: 'Medium',
    winProbability: 'Medium',
  },
  {
    id: '3',
    title: 'AGRICULTURAL GENOME BANK DESIGN',
    client: 'Ministry of Climate Change',
    status: 'Tender Stage',
    value: 78000000,
    probability: 'High',
    winProbability: 'High',
  },
  {
    id: '4',
    title: 'THE FARM HOUSE COMMUNITY CENTER',
    client: 'Dubai Municipality',
    status: 'Bidding',
    value: 32000000,
    probability: 'Medium',
    winProbability: 'Medium',
  },
  {
    id: '5',
    title: 'SHARJAH BOTANICAL RESEARCH FACILITY',
    client: 'Sharjah Investment Authority',
    status: 'Pre-Award',
    value: 96000000,
    probability: 'Low',
    winProbability: 'Low',
  },
];

export const Default: Story = {
  args: {
    tenders: mockTenders,
  },
};

export const Empty: Story = {
  args: {
    tenders: [],
  },
};

export const SingleTender: Story = {
  args: {
    tenders: [mockTenders[0]],
  },
};

export const LightMode: Story = {
  args: {
    tenders: mockTenders,
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

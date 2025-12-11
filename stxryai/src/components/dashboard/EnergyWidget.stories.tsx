import type { Meta, StoryObj } from '@storybook/react';
import EnergyWidget from './EnergyWidget';

const meta = {
  title: 'Dashboard/EnergyWidget',
  component: EnergyWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentEnergy: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    maxEnergy: {
      control: { type: 'number' },
    },
    isPremium: {
      control: { type: 'boolean' },
    },
    variant: {
      control: { type: 'select' },
      options: ['full', 'compact'],
    },
  },
} satisfies Meta<typeof EnergyWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: {
    currentEnergy: 75,
    maxEnergy: 100,
    isPremium: false,
    variant: 'full',
    nextRechargeTime: new Date(Date.now() + 3600000), // 1 hour from now
  },
};

export const LowEnergy: Story = {
  args: {
    currentEnergy: 20,
    maxEnergy: 100,
    isPremium: false,
    variant: 'full',
    nextRechargeTime: new Date(Date.now() + 1800000), // 30 minutes from now
  },
};

export const NoEnergy: Story = {
  args: {
    currentEnergy: 0,
    maxEnergy: 100,
    isPremium: false,
    variant: 'full',
    nextRechargeTime: new Date(Date.now() + 900000), // 15 minutes from now
  },
};

export const FullEnergy: Story = {
  args: {
    currentEnergy: 100,
    maxEnergy: 100,
    isPremium: false,
    variant: 'full',
  },
};

export const Premium: Story = {
  args: {
    currentEnergy: 100,
    maxEnergy: 100,
    isPremium: true,
    variant: 'full',
  },
};

export const Compact: Story = {
  args: {
    currentEnergy: 65,
    maxEnergy: 100,
    isPremium: false,
    variant: 'compact',
  },
};

export const CompactLow: Story = {
  args: {
    currentEnergy: 15,
    maxEnergy: 100,
    isPremium: false,
    variant: 'compact',
  },
};

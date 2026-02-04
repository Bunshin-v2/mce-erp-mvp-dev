import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const BrandPalette = () => {
  const colors = [
    { name: 'MCE Red', hex: '#c21719', variable: '--mce-red' },
    { name: 'MCE Red Accent', hex: '#ef5146', variable: '--mce-red-accent' },
    { name: 'MCE Teal', hex: '#51a2a8', variable: '--mce-teal' },
    { name: 'MCE Teal Soft', hex: '#a0d0d7', variable: '--mce-teal-soft' },
    { name: 'MCE Gray', hex: '#444444', variable: '--mce-gray' },
    { name: 'White', hex: '#ffffff', variable: '--white' },
  ];

  const semanticColors = [
    { name: 'Critical', variable: '--color-critical', usage: 'Errors, urgent alerts' },
    { name: 'Warning', variable: '--color-warning', usage: 'Warnings, high priority' },
    { name: 'Success', variable: '--color-success', usage: 'Success states, positive' },
    { name: 'Morgan Teal', variable: '--morgan-teal', usage: 'Brand accent, links' },
  ];

  return (
    <div className="p-8 space-y-8 bg-base">
      <div>
        <h1 className="text-2xl font-black italic font-oswald mb-2">PANTONE BRAND PALETTE</h1>
        <p className="text-tertiary">Visual injection of official MCE brand colors.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {colors.map((color) => (
          <div key={color.variable} className="flex flex-col gap-2">
            <div 
              className="h-24 w-full rounded-lg border border-[var(--surface-border)] shadow-sm"
              style={{ backgroundColor: `var(${color.variable})` }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold italic font-oswald uppercase tracking-widest">{color.name}</span>
              <span className="text-[10px] opacity-60 font-mono uppercase">{color.hex}</span>
              <span className="text-[10px] opacity-40 font-mono">{color.variable}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-black italic font-oswald mb-2">SEMANTIC COLORS</h2>
        <p className="text-tertiary mb-4">Theme-aware colors for states and feedback</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {semanticColors.map((color) => (
            <div key={color.variable} className="flex flex-col gap-2">
              <div
                className="h-20 w-full rounded-lg border border-[var(--surface-border)] shadow-sm"
                style={{ backgroundColor: `var(${color.variable})` }}
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold italic font-oswald uppercase tracking-widest">{color.name}</span>
                <span className="text-[10px] opacity-60">{color.usage}</span>
                <span className="text-[10px] opacity-40 font-mono">{color.variable}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 p-6 rounded-xl border-4 border-[var(--frame-border)] bg-white">
        <h2 className="text-lg font-black italic font-oswald mb-4 text-[var(--mce-teal)]">DASHBOARD FRAME PREVIEW (LIGHT MODE)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[var(--kpi-bg)] text-[var(--kpi-text-primary)]">
            <p className="text-[10px] uppercase font-black italic opacity-60">KPI CARD PREVIEW</p>
            <p className="text-2xl font-black italic font-oswald">AED 1.2M</p>
          </div>
          <div className="p-4 rounded-lg border border-[var(--surface-border)] hover:bg-[var(--brand-accent)]/[0.04] hover:text-[var(--brand-accent)] transition-all">
            <p className="text-[10px] uppercase font-black italic">TABLE ROW HOVER</p>
            <p className="text-sm">Project X Protocol Alpha</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof BrandPalette> = {
  title: 'Design System/Brand Palette',
  component: BrandPalette,
};

export default meta;
type Story = StoryObj<typeof BrandPalette>;

export const Default: Story = {};

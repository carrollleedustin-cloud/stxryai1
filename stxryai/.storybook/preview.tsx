import type { Preview } from '@storybook/react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0f0f1e',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'gray',
          value: '#1f2937',
        },
      ],
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
        <Story />
      </div>
    ),
  ],
};

export default preview;

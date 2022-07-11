import { WhatsNewContent } from '@popup/pages/app-container/whats-new/whats-new.interface';

export const WhatNew: WhatsNewContent = {
  version: '2.1.0',
  features: [
    {
      title: { en: 'Savings Auto Claim' },
      description: {
        en: 'Claim automatically your savings interests when they are available',
      },
      image: 'feature1.png',
      anchor: 'auto-claim-savings',
      extraInformation: {
        en: 'Try it from "Settings", "User preferences" and then "Automated tasks"',
      },
    },
    {
      title: { en: 'Hive Engine custom RPC' },
      description: {
        en: 'Select your favorite Hive Engine RPC configuration or create custom ones.',
      },
      image: 'hive-engine-rpc.png',
      anchor: 'hive-engine-custom-rpc',
      extraInformation: { en: 'Try it from "Tokens" and then "Settings' },
    },
  ],
};

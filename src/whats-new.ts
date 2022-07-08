import { WhatsNewContent } from '@popup/pages/app-container/whats-new/whats-new.interface';

export const WhatNew: WhatsNewContent = {
  version: '2.0.10',
  features: [
    {
      title: { en: 'Toto' },
      description: { en: 'Description of the new feature' },
      image: 'feature1.png',
    },
    {
      title: { en: 'Feature 2' },
      description: {
        en: 'Description of the new feature. Description of the new feature. Description of the new feature. Description of the new feature. Description of the new feature. Description of the new feature.',
      },
      image: 'feature1.png',
    },
    {
      title: { en: 'Feature 3' },
      description: {
        en: 'Description of the new feature. Description of the new feature. Description of the new featureDescription of the new feature',
      },
      image: 'feature1.png',
    },
  ],
};

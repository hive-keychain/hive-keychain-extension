import {
  Feature,
  Features,
  WhatsNewContent,
} from '@popup/pages/app-container/whats-new/whats-new.interface';

const versionLog2_2 = {
  url: 'https://hive-keychain.com',
  version: '2.2',
  features: {
    en: [
      {
        anchor: 'anchor0',
        image: 'https://source.com/img0.png',
        title: 'title feature 0',
        description: 'this is the description of feature 0',
        extraInformation: 'extra info 0',
      } as Feature,
      {
        anchor: 'anchor1',
        image: 'https://source.com/img1.png',
        title: 'title feature 1',
        description: 'this is the description of feature 1',
        extraInformation: 'extra info 1',
      } as Feature,
      {
        anchor: 'anchor2',
        image: 'https://source.com/img2.png',
        title: 'title feature 2',
        description: 'this is the description of feature 2',
        extraInformation: 'extra info 2',
      } as Feature,
      {
        anchor: 'anchor3',
        image: 'https://source.com/im3.png',
        title: 'title feature 3',
        description: 'this is the description of feature 3',
        extraInformation: 'extra info 3',
      } as Feature,
    ],
  } as Features,
} as WhatsNewContent;

const versionLog = {
  versionLog2_2,
};

export default versionLog;

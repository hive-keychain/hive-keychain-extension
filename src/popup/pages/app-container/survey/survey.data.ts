import { Survey } from '@popup/pages/app-container/survey/survey.interface';

export const SurveyData: Survey = {
  id: 1,
  title: "Help us shape Keychain's future!",
  description: [
    'Take this 4 minutes survey to help us better understand how you use Keychain and what you would like to see in the next versions.',
    'The survey is anonymous but if you give us your username, you will get a special badge on HiveBuzz to celebrate your commitment!',
  ],
  image:
    'https://files.peakd.com/file/peakd-hive/stoodkev/23uQiBc4eMeB4gjf5AfxzqK7FNgeWZTsJtq2RSjVs8Vg17SkTSmMpVpXZWwgGR4iCGYsU.png',
  link: 'https://forms.gle/PjrY9q61Nx1LUQfdA',
  expirationDate: new Date('2022-11-03'),
};

import { SurveyUtils } from '@hiveapp/utils/survey.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { SurveyData } from 'src/popup/hive/pages/app-container/survey/survey.data';
import { SurveyInfo } from 'src/popup/hive/pages/app-container/survey/survey.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('survey.utils.ts tests:\n', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });
  describe('getSurvey cases:\n', () => {
    it('Must return undefined if survey expired', async () => {
      const idSurveyData = SurveyData.id;
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue({ lastSurveyIdSeen: idSurveyData } as SurveyInfo);
      expect(await SurveyUtils.getSurvey()).toBeUndefined();
    });

    it('Must return data if survey active', async () => {
      const surveyDataDate = SurveyData.expirationDate;
      SurveyData.expirationDate = new Date('2050-11-03');
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue({ lastSurveyIdSeen: 0 } as SurveyInfo);
      expect(await SurveyUtils.getSurvey()).toEqual(SurveyData);
      SurveyData.expirationDate = surveyDataDate;
    });
  });

  describe('setCurrentAsSeen cases:\n', () => {
    it('Must call saveValueInLocalStorage', () => {
      const spySaveValueInLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      expect(SurveyUtils.setCurrentAsSeen()).toBeUndefined();
      expect(spySaveValueInLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.SURVEY_INFO,
        {
          lastSurveyIdSeen: SurveyData.id,
        },
      );
    });
  });
});

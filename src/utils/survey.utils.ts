import { SurveyData } from '@popup/pages/app-container/survey/survey.data';
import { SurveyInfo } from '@popup/pages/app-container/survey/survey.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import moment from 'moment';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getSurvey = async () => {
  const surveyInfo: SurveyInfo =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SURVEY_INFO,
    );
  const isCurrentExpired = moment(Date.now()).isSameOrAfter(
    SurveyData.expirationDate,
  );

  if (
    (!surveyInfo || surveyInfo.lastSurveyIdSeen < SurveyData.id) &&
    !isCurrentExpired
  ) {
    return SurveyData;
  }
};

const setCurrentAsSeen = () => {
  LocalStorageUtils.saveValueInLocalStorage(LocalStorageKeyEnum.SURVEY_INFO, {
    lastSurveyIdSeen: SurveyData.id,
  } as SurveyInfo);
};

export const SurveyUtils = { getSurvey, setCurrentAsSeen };

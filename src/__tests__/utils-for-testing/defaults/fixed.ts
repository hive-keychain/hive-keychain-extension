import { DynamicGlobalPropertiesUtils } from 'src/utils/dynamic-global-properties.utils';
import HiveUtils from 'src/utils/hive.utils';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const withFixedValues = () => {
  DynamicGlobalPropertiesUtils.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(dynamic.globalProperties);
  HiveUtils.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(dynamic.medianHistoryPrice);
  HiveUtils.getRewardFund = jest.fn().mockResolvedValue(dynamic.rewardFund);

  chrome.i18n.getMessage = jest
    .fn()
    .mockImplementation(mocksImplementation.i18nGetMessageCustom);
};

export default withFixedValues;

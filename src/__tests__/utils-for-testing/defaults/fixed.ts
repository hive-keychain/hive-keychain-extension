import HiveUtils from 'src/utils/hive.utils';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const withFixedValues = () => {
  HiveUtils.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(dynamic.globalProperties);
  HiveUtils.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(dynamic.globalProperties);
  HiveUtils.getRewardFund = jest.fn().mockResolvedValue(dynamic.rewardFund);

  chrome.i18n.getMessage = jest
    .fn()
    .mockImplementation(mocksImplementation.i18nGetMessageCustom);
};

export default withFixedValues;

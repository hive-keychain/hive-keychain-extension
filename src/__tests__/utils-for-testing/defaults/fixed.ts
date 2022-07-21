import HiveUtils from 'src/utils/hive.utils';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const withFixedValues = () => {
  console.log(
    'Executing withFixedValues should be the first thing to go out!!!',
  );

  HiveUtils.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(dynamic.globalProperties);
  HiveUtils.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(dynamic.globalProperties);
  HiveUtils.getRewardFund = jest.fn().mockResolvedValue(dynamic.rewardFund);

  // HiveUtils.getClient().database.getDynamicGlobalProperties = jest
  //   .fn()
  //   .mockResolvedValue(dynamic.globalProperties);
  // HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
  //   .fn()
  //   .mockResolvedValue(dynamic.medianHistoryPrice);
  // HiveUtils.getClient().database.call = jest
  //   .fn()
  //   .mockResolvedValue(dynamic.rewardFund);
  /////

  chrome.i18n.getMessage = jest
    .fn()
    .mockImplementation(mocksImplementation.i18nGetMessageCustom);
};

export default withFixedValues;

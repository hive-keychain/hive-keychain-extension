import HiveUtils from 'src/utils/hive.utils';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';

const withFixedValues = () => {
  HiveUtils.getClient().database.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(dynamic.globalProperties);
  HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(dynamic.medianHistoryPrice);
  HiveUtils.getClient().database.call = jest
    .fn()
    .mockResolvedValue(dynamic.rewardFund);
  chrome.i18n.getMessage = jest
    .fn()
    .mockImplementation(mocks.i18nGetMessageCustom);
};

export default withFixedValues;

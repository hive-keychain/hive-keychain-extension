import HiveUtils from 'src/utils/hive.utils';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
//TODO instead of using this data,
// use the new structure as /data/reward , /data/dynamicProps, etc... maybe one file per each type of data
const withFixedValues = () => {
  HiveUtils.getClient().database.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(utilsT.dynamicPropertiesObj);
  HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(utilsT.fakeCurrentMedianHistoryPrice);
  HiveUtils.getClient().database.call = jest
    .fn()
    .mockResolvedValue(utilsT.fakePostRewardFundResponse);
  chrome.i18n.getMessage = jest
    .fn()
    .mockImplementation(mocks.i18nGetMessageCustom);
};

export default withFixedValues;

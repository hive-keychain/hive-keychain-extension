import { DynamicGlobalProperties } from '@hiveio/dhive';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

/**
 * getClient().database.getDynamicGlobalProperties()
 */
const getDynamicGlobalProperties =
  async (): Promise<DynamicGlobalProperties> => {
    return HiveTxUtils.getData(
      'condenser_api.get_dynamic_global_properties',
      [],
    );
  };

export const DynamicGlobalPropertiesUtils = {
  getDynamicGlobalProperties,
};

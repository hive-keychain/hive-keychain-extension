import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { DynamicGlobalProperties } from '@hiveio/dhive';

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

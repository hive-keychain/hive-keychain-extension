import type { DynamicGlobalProperties } from '@hiveio/dhive';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

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

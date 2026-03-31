import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { DynamicGlobalPropertiesUtils } from 'src/popup/hive/utils/dynamic-global-properties.utils';

describe('DynamicGlobalPropertiesUtils', () => {
  it('delegates to condenser_api.get_dynamic_global_properties', async () => {
    const props = { head_block_number: 1 } as any;
    jest.spyOn(HiveTxUtils, 'getData').mockResolvedValue(props);

    await expect(
      DynamicGlobalPropertiesUtils.getDynamicGlobalProperties(),
    ).resolves.toBe(props);

    expect(HiveTxUtils.getData).toHaveBeenCalledWith(
      'condenser_api.get_dynamic_global_properties',
      [],
    );
  });
});

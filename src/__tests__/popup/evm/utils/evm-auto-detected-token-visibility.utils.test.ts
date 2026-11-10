import { EvmAutoDetectedTokenVisibilityUtils } from '@popup/evm/utils/evm-auto-detected-token-visibility.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('evm-auto-detected-token-visibility.utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('stores hidden auto-detected token addresses per chain', async () => {
    let storageValue: unknown;
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => storageValue);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        storageValue = value;
      });

    await EvmAutoDetectedTokenVisibilityUtils.hideAutoDetectedToken(
      '0x1',
      '0x00000000000000000000000000000000000000AA',
    );
    await EvmAutoDetectedTokenVisibilityUtils.hideAutoDetectedToken(
      '0x1',
      '0x00000000000000000000000000000000000000aa',
    );

    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenLastCalledWith(
      LocalStorageKeyEnum.EVM_HIDDEN_AUTO_DETECTED_TOKENS,
      {
        '0x1': ['0x00000000000000000000000000000000000000aa'],
      },
    );
    await expect(
      EvmAutoDetectedTokenVisibilityUtils.getHiddenAutoDetectedTokenAddresses(
        '0x1',
      ),
    ).resolves.toEqual(['0x00000000000000000000000000000000000000aa']);
  });

  it('removes restored auto-detected token addresses', async () => {
    let storageValue: unknown = {
      '0x1': ['0x00000000000000000000000000000000000000aa'],
    };
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async () => storageValue);
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (_key, value) => {
        storageValue = value;
      });

    await EvmAutoDetectedTokenVisibilityUtils.restoreAutoDetectedToken(
      '0x1',
      '0x00000000000000000000000000000000000000AA',
    );

    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenLastCalledWith(
      LocalStorageKeyEnum.EVM_HIDDEN_AUTO_DETECTED_TOKENS,
      {},
    );
  });
});

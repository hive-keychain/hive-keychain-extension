import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import * as responseLogic from 'src/content-scripts/hive/web-interface/response.logic';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('evm active account utils', () => {
  const chain = {
    chainId: '0x1',
    name: 'Ethereum',
    rpcs: [],
  } as EvmChain;

  let localStorageState: Partial<Record<LocalStorageKeyEnum, any>>;

  beforeEach(() => {
    localStorageState = {
      [LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET]: {
        [chain.chainId]: '0xaaa',
      },
      [LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]: {
        'https://affected.test': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa', '0xbbb'],
        },
        'https://still-a.test': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa'],
        },
        'https://already-b.test': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xbbb'],
        },
      },
    };

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => localStorageState[key]);

    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        localStorageState[key] = value;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('emits accountsChanged only for origins whose effective accounts change when the canonical active wallet changes', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    await EvmActiveAccountUtils.saveActiveAccountWallet(chain, '0xbbb');

    expect(
      localStorageState[LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET],
    ).toEqual({
      [chain.chainId]: '0xbbb',
    });
    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'https://affected.test',
      EvmEventName.ACCOUNT_CHANGED,
      ['0xbbb', '0xaaa'],
    );
  });

  it('does not emit duplicate accountsChanged when saving the same active wallet again', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    await EvmActiveAccountUtils.saveActiveAccountWallet(chain, '0xbbb');
    await EvmActiveAccountUtils.saveActiveAccountWallet(chain, '0xbbb');

    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenLastCalledWith(
      'https://affected.test',
      EvmEventName.ACCOUNT_CHANGED,
      ['0xbbb', '0xaaa'],
    );
  });
});

import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import * as responseLogic from 'src/content-scripts/hive/web-interface/response.logic';
import { saveConnectedAccountsRequest } from 'src/dialog/evm/requests/connect-accounts.logic';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('@popup/evm/utils/evm-addresses.utils', () => ({
  EvmAddressesUtils: {
    saveDomainAddress: jest.fn(),
  },
}));

describe('connect accounts logic', () => {
  let localStorageState: Partial<Record<LocalStorageKeyEnum, any>>;

  beforeEach(() => {
    localStorageState = {};

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

  it('persists the same eth_accounts permission state for eth_requestAccounts and wallet_requestPermissions', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    const requestAccountsResult = await saveConnectedAccountsRequest(
      EvmRequestMethod.REQUEST_ACCOUNTS,
      ['0xAaA'],
      'https://app.test',
    );
    const requestAccountsState = JSON.parse(
      JSON.stringify(localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]),
    );

    localStorageState = {};
    sendEvmEventToDomain.mockClear();

    const requestPermissionsResult = await saveConnectedAccountsRequest(
      EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
      ['0xAaA'],
      'https://app.test',
    );

    expect(requestAccountsResult).toEqual(['0xaaa']);
    expect(requestPermissionsResult).toEqual([
      { parentCapability: EvmRequestPermission.ETH_ACCOUNTS },
    ]);
    expect(localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]).toEqual(
      requestAccountsState,
    );
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'https://app.test',
      EvmEventName.ACCOUNT_CHANGED,
      ['0xAaA'],
    );
  });

  it('does not emit duplicate accountsChanged when both request flows persist the same origin state', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    await saveConnectedAccountsRequest(
      EvmRequestMethod.REQUEST_ACCOUNTS,
      ['0xaaa'],
      'https://app.test',
    );
    await saveConnectedAccountsRequest(
      EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
      ['0xaaa'],
      'https://app.test',
    );

    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'https://app.test',
      EvmEventName.ACCOUNT_CHANGED,
      ['0xaaa'],
    );
  });

  it('keeps eth_accounts permissions origin-scoped across the shared connect flow', async () => {
    await saveConnectedAccountsRequest(
      EvmRequestMethod.REQUEST_ACCOUNTS,
      ['0xaaa'],
      'http://localhost:3000',
    );
    await saveConnectedAccountsRequest(
      EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
      ['0xbbb'],
      'http://localhost:5173',
    );

    expect(localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]).toEqual(
      {
        'http://localhost:3000': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa'],
        },
        'http://localhost:5173': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xbbb'],
        },
      },
    );
  });
});

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

  it('replaces the origin eth_accounts list with the selected subset instead of appending', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS] = {
      'https://app.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa', '0xbbb'],
      },
    };

    const result = await saveConnectedAccountsRequest(
      EvmRequestMethod.REQUEST_ACCOUNTS,
      ['0xbbb'],
      'https://app.test',
    );

    expect(result).toEqual(['0xbbb']);
    expect(localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]).toEqual(
      {
        'https://app.test': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xbbb'],
        },
      },
    );
    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'https://app.test',
      EvmEventName.ACCOUNT_CHANGED,
      ['0xbbb'],
    );
  });

  it('adds newly selected accounts while preserving the provided selection order', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS] = {
      'https://app.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xbbb'],
      },
    };

    const result = await saveConnectedAccountsRequest(
      EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
      ['0xccc', '0xbbb'],
      'https://app.test',
    );

    expect(result).toEqual([
      { parentCapability: EvmRequestPermission.ETH_ACCOUNTS },
    ]);
    expect(localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]).toEqual(
      {
        'https://app.test': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xccc', '0xbbb'],
        },
      },
    );
    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'https://app.test',
      EvmEventName.ACCOUNT_CHANGED,
      ['0xccc', '0xbbb'],
    );
  });

  it('clears the origin eth_accounts permission when the confirmed selection is empty', async () => {
    const sendEvmEventToDomain = jest
      .spyOn(responseLogic, 'sendEvmEventToDomain')
      .mockImplementation(jest.fn());

    localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS] = {
      'https://app.test': {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xaaa'],
      },
    };

    const result = await saveConnectedAccountsRequest(
      EvmRequestMethod.REQUEST_ACCOUNTS,
      [],
      'https://app.test',
    );

    expect(result).toEqual([]);
    expect(localStorageState[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS]).toEqual(
      {
        'https://app.test': {},
      },
    );
    expect(sendEvmEventToDomain).toHaveBeenCalledTimes(1);
    expect(sendEvmEventToDomain).toHaveBeenCalledWith(
      'https://app.test',
      EvmEventName.ACCOUNT_CHANGED,
      [],
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

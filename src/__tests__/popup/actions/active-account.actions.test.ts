import AccountUtils from '@hiveapp/utils/account.utils';
import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { sleep } from '@hiveio/dhive/lib/utils';
import { LocalAccount } from '@interfaces/local-account.interface';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { defaultChainList } from '@popup/multichain/reference-data/chains.list';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateDifferentAccounts,
  initialStateNoKeys,
  initialStateWOneKey,
} from 'src/__tests__/utils-for-testing/initial-states';
import * as activeAccountActions from 'src/popup/hive/actions/active-account.actions';

describe('active-account.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const fakeExtendedAccountResponse = [
    {
      name: userData.two.username,
      reputation: 100,
    } as ExtendedAccount,
  ];
  const fakeManaBarResponse = {
    current_mana: 1000,
    max_mana: 10000,
    percentage: 100,
  } as Manabar;
  describe('refreshActiveAccount tests:\n', () => {
    test('Must refresh the activeAccount', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValue(fakeExtendedAccountResponse[0]);
      AccountUtils.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);
      let fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(
        activeAccountActions.refreshActiveAccount(),
      );
      const delay = 3100;
      await sleep(delay);
      expect(fakeStore.getState().hive.activeAccount).toEqual({
        account: fakeExtendedAccountResponse[0],
        keys: userData.two.keys,
        name: userData.two.username,
        rc: fakeManaBarResponse,
      });
    });
    test('If the activeAccount is not located in accounts, wont refresh', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValue(fakeExtendedAccountResponse[0]);
      AccountUtils.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);

      let fakeStore = getFakeStore(initialStateDifferentAccounts);
      await fakeStore.dispatch<any>(
        activeAccountActions.refreshActiveAccount(),
      );
      const delay = 3100;
      await sleep(delay);
      expect(fakeStore.getState().hive.activeAccount).toEqual(
        initialStateDifferentAccounts.hive.activeAccount,
      );
    });
  });

  describe('refreshKeys tests:\n', () => {
    test('Must set keys on activeAccount', async () => {
      const localAccount = {
        name: userData.two.username,
        keys: userData.two.keys,
      } as LocalAccount;
      const fakeStore = getFakeStore(initialStateNoKeys);
      await fakeStore.dispatch<any>(
        activeAccountActions.refreshKeys(localAccount),
      );
      expect(fakeStore.getState().hive.activeAccount).toEqual({
        account: {
          name: localAccount.name,
        },
        keys: localAccount.keys,
        name: localAccount.name,
        rc: {},
      });
    });
  });
  describe('loadActiveAccount tests:\n', () => {
    test('must refreshKeys and set activeAccount', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValue(fakeExtendedAccountResponse[0]);
      AccountUtils.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);

      const stateWithRpc = {
        ...initialEmptyStateStore,
        hive: {
          ...initialEmptyStateStore.hive,
          activeRpc: { uri: 'https://api.hive.blog', testnet: false },
        },
      };
      let fakeStore = getFakeStore(stateWithRpc);
      await fakeStore.dispatch<any>(
        activeAccountActions.loadActiveAccount({
          ...userData.two,
          name: userData.two.username,
        }),
      );
      expect(fakeStore.getState().hive.activeAccount).toEqual({
        account: fakeExtendedAccountResponse[0],
        keys: userData.two.keys,
        name: userData.two.username,
        rc: fakeManaBarResponse,
      });
    });
  });

  describe('getAccountRC tests:\n', () => {
    test('Must set manabar of activeAccount', async () => {
      AccountUtils.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);

      let fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(
        activeAccountActions.getAccountRC(userData.two.username),
      );
      expect(fakeStore.getState().hive.activeAccount).toEqual({
        account: {
          name: userData.two.username,
        },
        keys: userData.two.keys,
        name: userData.two.username,
        rc: fakeManaBarResponse,
      });
    });
  });

  describe('activateHiveAccount tests:\n', () => {
    const hiveChain = defaultChainList.find(
      (chain) => chain.type === ChainType.HIVE,
    )!;
    const evmChain = {
      name: 'Ethereum',
      type: ChainType.EVM,
      logo: '',
      chainId: '0x1',
      rpcs: [],
    };
    const account = {
      name: userData.two.username,
      keys: userData.two.keys,
    } as LocalAccount;

    const getStateWithChain = (chain: typeof evmChain | typeof hiveChain) => ({
      ...initialEmptyStateStore,
      chain,
      hive: {
        ...initialEmptyStateStore.hive,
        activeRpc: { uri: 'https://api.hive.blog', testnet: false },
      },
    });

    beforeEach(() => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValue(fakeExtendedAccountResponse[0]);
      AccountUtils.getRCMana = jest.fn().mockResolvedValue(fakeManaBarResponse);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('switches an EVM chain to the setup Hive chain', async () => {
      jest
        .spyOn(ChainUtils, 'getAllSetupChainsForType')
        .mockResolvedValue([hiveChain] as never);
      const fakeStore = getFakeStore(getStateWithChain(evmChain));

      await fakeStore.dispatch<any>(
        activeAccountActions.activateHiveAccount(account),
      );

      expect(fakeStore.getState().chain).toEqual(hiveChain);
      expect(fakeStore.getState().activeAccountType).toBe(ChainType.HIVE);
      expect(fakeStore.getState().hive.activeAccount.name).toBe(account.name);
    });

    test('uses the base Hive chain when Hive is missing from the setup list', async () => {
      jest
        .spyOn(ChainUtils, 'getAllSetupChainsForType')
        .mockResolvedValue([] as never);
      jest
        .spyOn(ChainUtils, 'getSetupChains')
        .mockResolvedValue([hiveChain] as never);
      const fakeStore = getFakeStore(getStateWithChain(evmChain));

      await fakeStore.dispatch<any>(
        activeAccountActions.activateHiveAccount(account),
      );

      expect(ChainUtils.getSetupChains).toHaveBeenCalledWith(true);
      expect(fakeStore.getState().chain).toEqual(hiveChain);
      expect(fakeStore.getState().activeAccountType).toBe(ChainType.HIVE);
    });

    test('keeps the current chain when it is already the Hive chain', async () => {
      jest
        .spyOn(ChainUtils, 'getAllSetupChainsForType')
        .mockResolvedValue([hiveChain] as never);
      const currentChain = hiveChain;
      const fakeStore = getFakeStore(getStateWithChain(currentChain));

      await fakeStore.dispatch<any>(
        activeAccountActions.activateHiveAccount(account),
      );

      expect(fakeStore.getState().chain).toBe(currentChain);
      expect(fakeStore.getState().activeAccountType).toBe(ChainType.HIVE);
    });
  });

  describe('resetActiveAccount tests:\n', () => {
    const defaultResetValues = {
      account: {} as ExtendedAccount,
      keys: {},
      rc: {} as Manabar,
    };
    test('Must reset activeAccount to default values', async () => {
      const fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(activeAccountActions.resetActiveAccount());
      expect(fakeStore.getState().hive.activeAccount).toEqual(defaultResetValues);
    });
  });
});

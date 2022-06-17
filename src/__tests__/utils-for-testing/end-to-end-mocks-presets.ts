//intended to use when many components share the same
//initial mocks as starting point
//TODO: refactor on each component After finishing E2E tests.
import { LocalAccount } from '@interfaces/local-account.interface';
import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

export enum MockPreset {
  HOMEDEFAULT = 'home-default',
  ERRORDELEGATIONS = 'error-delegation',
}

const load = (preset: MockPreset, mk: string, accounts: LocalAccount[]) => {
  const defaultPresets = {
    app: mocks.mocksApp({
      fixPopupOnMacOs: jest.fn(),
      getValueFromLocalStorage: jest
        .fn()
        .mockImplementation(mocks.getValuefromLS),
      getCurrentRpc: fakeData.rpc.fake,
      activeAccountUsername: mk,
      getRCMana: fakeData.manabar.manabarMin,
      getAccounts: fakeData.accounts.extendedAccountFull,
      rpcStatus: true,
      setRpc: jest.fn(),
      chromeSendMessage: jest.fn(),
      hasStoredAccounts: true,
      mkLocal: mk,
      getAccountsFromLocalStorage: accounts,
      hasVotedForProposal: true,
      voteForKeychainProposal: jest.fn(),
      chromeTabsCreate: jest.fn(),
      i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
      saveValueInLocalStorage: jest.fn(),
      clearLocalStorage: jest.fn(),
      removeFromLocalStorage: jest.fn(),
    }),
    home: mocks.mocksHome({
      getPrices: fakeData.prices,
      getAccountValue: '100000',
    }),
    topBar: mocks.mocksTopBar({
      hasReward: false,
    }),
    powerUp: mocks.mocksPowerUp({
      getVestingDelegations: jest
        .fn()
        .mockResolvedValue(utilsT.fakeGetDelegateesResponse),
    }),
    delegations: mocks.mocksDelegations({
      getDelegators: jest.fn().mockResolvedValue({
        data: utilsT.fakeGetDelegatorsResponse,
      }),
    }),
    walletHistory: mocks.mocksWalletHistory({
      getAccountTransactions: jest
        .fn()
        .mockResolvedValue(utilsT.expectedDataGetAccountHistory),
    }),
    tokens: mocks.mocksTokens({
      getAllTokens: jest.fn().mockResolvedValue(utilsT.fakeTokensResponse),
      getUserBalance: jest
        .fn()
        .mockResolvedValue(utilsT.fakeGetUserBalanceResponse),
    }),
  };
  let presetObj = {
    preset: defaultPresets,
    description: 'This preset will load all needed to load home page',
  };
  switch (preset) {
    case MockPreset.ERRORDELEGATIONS:
      presetObj = {
        preset: {
          ...defaultPresets,
          powerUp: mocks.mocksPowerUp({
            getVestingDelegations: jest.fn(),
          }),
          delegations: mocks.mocksDelegations({
            getDelegators: jest.fn(),
          }),
        },
        description: 'This presets load home but no delegations response',
      };
      break;
    case MockPreset.HOMEDEFAULT:
      break;
  }
  return presetObj;
};

const mockPreset = {
  load,
};

export default mockPreset;

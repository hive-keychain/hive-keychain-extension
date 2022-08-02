import { Asset, ExtendedAccount } from '@hiveio/dhive';
import { ReactElement } from 'react';
import HiveUtils from 'src/utils/hive.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

interface NoRewardKey {
  noRewards?: boolean;
  removePostingKey?: boolean;
}

const i18n = {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, [extra]),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  noPostingKey: i18n.get('popup_accounts_err_claim').trim(),
  claiming: i18n.get('popup_html_claiming_rewards').trim(),
  newExtendedAccount: {
    ...accounts.extended,
    balance: new Asset(666, 'HIVE'),
  } as ExtendedAccount,
  updatedBalance: '666.000',
};

const beforeEach = async (component: ReactElement, toUse?: NoRewardKey) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  if (toUse?.noRewards) {
    mockPreset.setOrDefault({ topBar: { hasReward: false } });
  }
  if (toUse?.removePostingKey) {
    methods.removePostingKey();
  }
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  removePostingKey: () => {
    delete constants.stateAs.accounts[0].keys.posting;
    delete constants.stateAs.accounts[0].keys.postingPubkey;
  },
  assertButtons: () => {
    assertion.getByText([
      { arialabelOrText: alButton.menu, query: QueryDOM.BYLABEL },
      { arialabelOrText: alButton.logOut, query: QueryDOM.BYLABEL },
    ]);
  },
};

const extraMocks = {
  claimRewards: () => {
    HiveUtils.claimRewards = jest.fn().mockResolvedValue(true);
  },
  getAccounts: () => {
    HiveUtils.getClient().database.getAccounts = jest
      .fn()
      .mockResolvedValue([constants.newExtendedAccount]);
  },
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};

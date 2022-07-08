import KeychainApi from '@api/keychain';
import { ReactElement } from 'react';
import HiveUtils from 'src/utils/hive.utils';
import keyMessage from 'src/__tests__/popup/pages/app-container/home/transfer-fund/mocks/keyMessages/keyMessage';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const constants = {
  username: mk.user.one,
  anotherUser: mk.user.two,
  phishingAccount: phishing.accounts.data[0],
  exchange: {
    accepting: {
      hive: 'bittrex',
      hbd: 'ionomy',
    },
    notAccepting: {
      hive: 'binance-hot',
      hbd: 'hot.dunamu',
    },
  },
  memoMessage: {
    nonEncrypted: 'This is an awesome test on Hive Keychain!',
    toEncrypt: '# This is encrypted MEMO on HIVE Keychain.',
    encryptedLabel: '# This is encrypted MEMO on HIVE Keychain. (encrypted)',
  },
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  balanceTextOnScreen: {
    hive: ['Balance', '1,000.000 HIVE'],
    hbd: ['Balance', '1,000.000 HBD'],
  },
  keyMessage: keyMessage.extraConstants,
};

const beforeEach = async (
  component: ReactElement,
  dropDownTo: string,
  remove?: {
    activeKey?: string;
    memoKey?: string;
  },
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  if (remove?.activeKey) {
    methods.removeKey(remove.activeKey);
  }
  if (remove?.memoKey) {
    methods.removeKey(remove.memoKey);
  }
  extraMocks.getPhishingAccounts();
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await methods.clickArrowTo(dropDownTo);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  clickArrowTo: async (dropDownTo: string) => {
    let ariaLabels = [alDropdown.span.send];
    if (dropDownTo === 'HIVE') {
      ariaLabels.unshift(alDropdown.arrow.hive);
    } else if (dropDownTo === 'HBD') {
      ariaLabels.unshift(alDropdown.arrow.hbd);
    }
    await clickAwait(ariaLabels);
  },
  removeKey: (key: string) => {
    delete constants.stateAs.accounts[0].keys[key];
    delete constants.stateAs.accounts[0].keys[`${key}Pubkey`]; //
  },
  selectBalance: (currency: string) => {
    switch (currency) {
      case 'HIVE':
        return constants.balanceTextOnScreen.hive;
      case 'HBD':
        return constants.balanceTextOnScreen.hbd;
      default:
        return [];
    }
  },
};

const extraMocks = {
  getPhishingAccounts: () => {
    KeychainApi.get = jest.fn().mockResolvedValue(phishing.accounts);
  },
  transfer: (transfer: boolean) =>
    (HiveUtils.transfer = jest.fn().mockResolvedValueOnce(transfer)),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};

import { ExtendedAccount } from '@hiveio/dhive';
import { RC } from '@interfaces/active-account.interface';
import { ReactElement } from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, [extra]),
};

const constants = {
  stateAs: initialStates.iniStateAs.defaultExistent as RootState,
  username: mk.user.one,
  noMana: '--',
  zeroRc: 'speedResource Credits0.00 %',
  wMana: '1.00 % (1.00 $)',
  wRc: '1.00 %',
  toolTip: {
    fullIn: 'Full in 4 days, 22 hours and 48 minutes',
    noHp: i18n.get('html_popup_voting_no_hp'),
  },
  manabarZero: {
    current_mana: 0,
    percentage: 0,
    delegated_rc: 0,
    received_delegated_rc: 0,
    max_rc: 0,
    max_mana: 0,
  } as RC,
  extendedZeroVotingMana: {
    ...accounts.extended,
    voting_manabar: {
      current_mana: 0,
    },
  } as ExtendedAccount,
};

const beforeEach = async (
  component: ReactElement,
  manabarRcZero: boolean = false,
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (manabarRcZero) {
    mockPreset.setOrDefault({
      app: {
        getExtendedAccount: constants.extendedZeroVotingMana,
        getRCMana: constants.manabarZero,
      },
    });
  } else {
    mockPreset.setOrDefault({});
  }
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(mk.user.one);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

export default {
  beforeEach,
  methods,
  constants,
};

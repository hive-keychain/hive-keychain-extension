import { ExtendedAccount } from '@hiveio/dhive';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { screen } from '@testing-library/react';
import { ReactElement } from 'react';
import ProxyUtils from 'src/utils/proxy.utils';
import WitnessUtils from 'src/utils/witness.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType, Tab } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import {
  MockProxy,
  MocksToUse,
} from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  actRunAllTimers,
  clickAwait,
  clickTypeAwait,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, extra),
};

const accountProxy = 'keychain';

const constants = {
  stateAs: initialStates.iniStateAs.defaultExistent,
  missingKey: i18n.get('popup_missing_key', [KeychainKeyTypesLC.active]),
  introMessage: {
    noProxy: i18n.get('html_popup_witness_proxy_definition').trim(),
    proxy: i18n.get('html_popup_witness_has_proxy').trim(),
  },
  successMessage: i18n.get('popup_success_proxy', ['keychain']).trim(),
  successClear: i18n.get('bgd_ops_unproxy', [`@${accountProxy}`]),
  errorMessage: {
    set: i18n.get('html_popup_set_as_proxy_error').trim(),
    clear: i18n.get('html_popup_clear_proxy_error').trim(),
  },
  extendedWProxy: {
    ...accounts.extended,
    proxy: accountProxy,
  } as ExtendedAccount,
};

const beforeEach = async (
  component: ReactElement,
  removeActiveKey: boolean = false,
  hasInitialProxy: boolean,
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  let objData: MocksToUse = {};
  if (hasInitialProxy) {
    objData = { app: { getExtendedAccount: constants.extendedWProxy } };
    extraMocks({ findUserProxy: accountProxy });
  }
  mockPreset.setOrDefault(objData);
  if (removeActiveKey === true) {
    delete constants.stateAs.accounts[0].keys.active;
    delete constants.stateAs.accounts[0].keys.activePubkey;
  }
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(mk.user.one);
  await methods.clickGovernance();
  actRunAllTimers();
  await methods.gotoTab(Tab.PROXY);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  clickGovernance: async () => {
    await clickAwait([alButton.menu, alButton.menuPreFix + alIcon.governance]);
  },
  gotoTab: async (tab: Tab) => {
    await userEventPendingTimers.click(screen.getAllByRole('tab')[tab]);
  },
  typeNClick: async (setProxyAs: string) => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.username,
        event: EventType.TYPE,
        text: setProxyAs,
      },
      {
        ariaLabel: alButton.operation.proxy.tab.setAsProxy,
        event: EventType.CLICK,
      },
    ]);
  },
};

const extraMocks = (toUse: MockProxy) => {
  ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(toUse.findUserProxy);
  WitnessUtils.setAsProxy = jest.fn().mockResolvedValue(toUse.setAsProxy);
  WitnessUtils.removeProxy = jest.fn().mockResolvedValueOnce(toUse.removeProxy);
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
  accountProxy,
};

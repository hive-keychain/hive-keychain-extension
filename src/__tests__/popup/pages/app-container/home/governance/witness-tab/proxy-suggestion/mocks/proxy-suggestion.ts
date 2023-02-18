import { ExtendedAccount } from '@hiveio/dhive';
import { ReactElement } from 'react';
import ProxyUtils from 'src/utils/proxy.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
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
  stateAs: initialStates.iniStateAs.defaultExistent,
  extendedNoVotes: {
    ...accounts.extended,
    witnesses_voted_for: 0,
  } as ExtendedAccount,
  message: {
    suggestion: i18n.get('popup_html_proxy_suggestion'),
    success: i18n.get('popup_success_proxy', ['keychain']),
    error: i18n.get('popup_error_proxy', ['keychain']),
  },
  closed: 'proxy-suggestion hide',
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    app: { getExtendedAccount: constants.extendedNoVotes },
  });
  extraMocks(false);
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(mk.user.one);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = (setAsProxy: boolean) => {
  ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
  ProxyUtils.setAsProxy = jest.fn().mockResolvedValue(setAsProxy);
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};

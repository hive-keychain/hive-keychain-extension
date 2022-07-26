import AccountUtils from 'src/utils/account.utils';
import TransferUtils from 'src/utils/transfer.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRenderFixed } from 'src/__tests__/utils-for-testing/setups/render-fragment';

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  snapshotName: {
    tokens: {
      with: {
        transferIcons: 'tokens-transfer.component ICONS',
      },
    },
    noData: '',
  },
  messages: {
    missingField: i18n.get('popup_accounts_fill'),
    negativeAmount: i18n.get('popup_html_need_positive_amount'),
    wrongUser: i18n.get('popup_no_such_account'),
    notEnoughBalance: i18n.get('popup_html_power_up_down_error'),
  },
  selectedToken: {
    data: tokensUser.balances.filter((token) => token.symbol === 'LEO')[0],
  },
};
/**
 * Intended to use App component as default.
 * You must use only inner params to handle different data/initialState.
 * Also it will return the fragment to use the snapshots feature.
 * @link https://jestjs.io/docs/snapshot-testing or https://goo.gl/fbAQLP
 */
const beforeEach = async (noTokensBalance: boolean = false) => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});

  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;

  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.tokens]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  doesAccountExist: (exist: boolean) =>
    (AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(exist)),
  getPublicMemo: () =>
    (AccountUtils.getPublicMemo = jest
      .fn()
      .mockResolvedValue(userData.one.encryptKeys.memo)),
  getExchangeValidationWarning: () =>
    (TransferUtils.getExchangeValidationWarning = jest
      .fn()
      .mockResolvedValue(null)),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};

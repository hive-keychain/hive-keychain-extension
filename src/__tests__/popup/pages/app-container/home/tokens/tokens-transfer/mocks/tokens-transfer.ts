import AccountUtils from 'src/utils/account.utils';
import HiveUtils from 'src/utils/hive.utils';
import BlockchainTransactionUtils, {
  TransactionConfirmationResult,
} from 'src/utils/tokens.utils';
import TransferUtils from 'src/utils/transfer.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import {
  EventType,
  KeyToUse,
} from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ClickOrType } from 'src/__tests__/utils-for-testing/interfaces/events';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRenderFixed } from 'src/__tests__/utils-for-testing/setups/render-fragment';

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  messages: {
    missingField: i18n.get('popup_accounts_fill'),
    negativeAmount: i18n.get('popup_html_need_positive_amount'),
    wrongUser: i18n.get('popup_no_such_account'),
    notEnoughBalance: i18n.get('popup_html_power_up_down_error'),
    phishingWarning: i18n.get('popup_warning_phishing', [
      phishing.accounts.data[1],
    ]),
    success: i18n.get('popup_html_transfer_successful', [
      '@theghost1980',
      '1.000 LEO',
    ]),
    failed: i18n.get('popup_html_transfer_failed'),
    timeOut: i18n.get('popup_token_timeout'),
    missingActiveKey: i18n.get('popup_missing_key', [KeyToUse.ACTIVE]),
    missingMemoKey: i18n.get('popup_html_memo_key_missing'),
  },
  selectedToken: {
    data: tokensUser.balances.filter((token) => token.symbol === 'LEO')[0],
  },
  memo: {
    toEncrypt: '#fake memorandum hivekeychain',
    encrypted: '#fake memorandum hivekeychain (encrypted)',
  },
  phishingAccount: phishing.accounts.data[1],
};

const beforeEach = async (toUse?: {
  noTokensBalance?: boolean;
  noKey?: KeyToUse;
}) => {
  let _asFragment: () => DocumentFragment;
  let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (toUse?.noTokensBalance) {
    remock = { tokens: { getUserBalance: [] } };
  }
  if (toUse?.noKey) {
    methods.removeKey(toUse.noKey);
  }
  mockPreset.setOrDefault(remock);
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
  removeKey: (key: KeyToUse) => {
    delete constants.stateAs.accounts[0].keys[key];
    delete constants.stateAs.accounts[0].keys[`${key}Pubkey`];
  },
  userInteraction: async (toUse: {
    receiverUsername: string;
    amount: string;
    hasMemo?: boolean;
    confirm?: boolean;
  }) => {
    let domEl: ClickOrType[] = [
      {
        ariaLabel: alInput.username,
        event: EventType.TYPE,
        text: toUse.receiverUsername,
      },
      {
        ariaLabel: alInput.amount,
        event: EventType.TYPE,
        text: toUse.amount,
      },
      {
        ariaLabel: alButton.operation.tokens.transfer.send,
        event: EventType.CLICK,
      },
    ];
    if (toUse.hasMemo) {
      domEl.splice(1, 0, {
        ariaLabel: alInput.memoOptional,
        event: EventType.TYPE,
        text: constants.memo.toEncrypt,
      });
    }
    if (toUse.confirm) {
      domEl.push({
        ariaLabel: alButton.dialog.confirm,
        event: EventType.CLICK,
      });
    }
    await clickTypeAwait(domEl);
  },
};

const extraMocks = {
  doesAccountExist: (exist: boolean) =>
    (AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(exist)),
  getPublicMemo: () =>
    (AccountUtils.getPublicMemo = jest
      .fn()
      .mockResolvedValue(userData.one.encryptKeys.memo)),
  sendCustomJson: (result: string | true | undefined) =>
    (HiveUtils.sendCustomJson = jest.fn().mockResolvedValue(result)),
  saveTransferRecipient: () =>
    (TransferUtils.saveFavoriteUser = jest.fn().mockResolvedValue(undefined)),
  tryConfirmTransaction: (result: TransactionConfirmationResult) =>
    (BlockchainTransactionUtils.tryConfirmTransaction = jest
      .fn()
      .mockResolvedValue(result)),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};

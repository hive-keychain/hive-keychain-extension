import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import { RootState } from '@popup/store';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
//TODO delete file after refactoring token-operation related tests

const operationResult = {
  confirmed: { confirmed: true, error: null },
  error: { confirmed: true, error: 'error_token_transaction' },
  timeOut: undefined,
};

const leoTokenData = tokensUser.balances.filter(
  (token) => token.symbol === 'LEO',
)[0];

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  message: {
    disclaimer: i18n.get('popup_html_tokens_operation_text'),
    confirmation: (operation: TokenOperationType) =>
      i18n.get(`popup_html_${operation}_tokens_confirm_text`),
    operationConfirmed: (operation: TokenOperationType) =>
      i18n.get(`popup_html_${operation}_tokens_success`),
    error: {
      noSuchAccount: i18n.get('popup_no_such_account'),
      notEnoughBalance: i18n.get('popup_html_power_up_down_error'),
      transactionFailed: (operationType: TokenOperationType) =>
        i18n.get(`popup_html_${operationType}_tokens_failed`),
      timeOut: i18n.get('popup_token_timeout'),
      noActivekey: i18n.get('popup_missing_key', [KeychainKeyTypesLC.active]),
    },
    loading: {
      text: i18n.get('popup_html_loading'),
      operation: (operation: TokenOperationType) =>
        i18n.get(`popup_html_${operation}_tokens`) + '...',
    },
  },
  title: (operation: TokenOperationType) =>
    i18n.get(`popup_html_${operation}_tokens`),
  leoToken: {
    unstakeDisclaimer: i18n.get(
      'popup_html_token_unstake_cooldown_disclaimer',
      [
        tokensList.alltokens
          .filter((token) => token.symbol === 'LEO')[0]
          .unstakingCooldown.toString(),
      ],
    ),
    screenInfo: {
      stake: [
        `${leoTokenData.balance} LEO`,
        i18n.get('popup_html_balance'),
        i18n.get('popup_html_token_stake'),
      ],
      unstake: [
        `${leoTokenData.stake} LEO`,
        i18n.get('popup_html_balance'),
        i18n.get('popup_html_token_unstake'),
      ],
      delegate: [
        `${leoTokenData.stake} LEO`,
        i18n.get('popup_html_balance'),
        i18n.get('popup_html_token_delegate'),
      ],
    },
    typeValues: {
      balance: {
        exceeded: '10000',
        min: '1',
      },
    },
  },
  tokenOperationResult: { id: '65d9cc4db737' },
  displayedCommon: ['1.00000000 LEO', 'Amount', 'Cancel', 'Confirm'],
  displayedDelegating: ['To', `@${mk.user.two}`],
  i18n: i18n,
};

const tokenOperationConstants = {
  constants,
};

export default tokenOperationConstants;

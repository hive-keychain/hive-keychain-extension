import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  goBack,
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { fetchPhishingAccounts } from '@popup/actions/phishing.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SummaryPanelComponent } from 'src/common-ui/summary-panel/summary-panel.component';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
import { FavoriteUserUtils } from 'src/utils/favorite-user.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import TokensUtils from 'src/utils/tokens.utils';
import './token-operation.component.scss';

export enum TokenOperationType {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  DELEGATE = 'delegate',
}

const TokensOperation = ({
  operationType,
  activeAccount,
  tokenBalance,
  tokenInfo,
  formParams,
  localAccounts,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  goBack,
}: PropsFromRedux) => {
  const [receiverUsername, setReceiverUsername] = useState(
    formParams.receiverUsername
      ? formParams.receiverUsername
      : operationType === TokenOperationType.DELEGATE
      ? ''
      : activeAccount.name,
  );
  const [amount, setAmount] = useState(
    formParams.amount ? formParams.amount : '',
  );
  let balance: number | string;
  switch (operationType) {
    case TokenOperationType.UNSTAKE:
      balance =
        parseFloat(tokenBalance.stake) -
        parseFloat(tokenBalance.pendingUnstake);
      break;
    case TokenOperationType.STAKE:
      balance = tokenBalance.balance;
      break;
    case TokenOperationType.DELEGATE:
      balance =
        parseFloat(tokenBalance.stake) -
        parseFloat(tokenBalance.pendingUnstake);
      break;
  }

  const symbol = formParams.symbol ? formParams.symbol : tokenBalance.symbol;

  const [autocompleteFavoriteUsers, setAutocompleteFavoriteUsers] =
    useState<AutoCompleteValues>({ categories: [] });

  useEffect(() => {
    setTitleContainerProperties({
      title: `popup_html_${operationType}_tokens`,
      isBackButtonEnabled: true,
    });
    loadAutocompleteFavoriteUsers();
  }, []);

  const loadAutocompleteFavoriteUsers = async () => {
    setAutocompleteFavoriteUsers(
      await FavoriteUserUtils.getAutocompleteListByCategories(
        activeAccount.name!,
        localAccounts,
      ),
    );
  };

  const setAmountToMaxValue = () => {
    setAmount(parseFloat(balance.toString()));
  };

  const getFormParams = () => {
    return {
      receiverUsername: receiverUsername,
      amount: amount.toString(),
      symbol: symbol,
      balance: balance,
    };
  };

  const handleClickOnSend = async () => {
    if (!(await AccountUtils.doesAccountExist(receiverUsername))) {
      setErrorMessage('popup_no_such_account');
      return;
    }

    if (parseFloat(amount.toString()) <= 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(amount.toString()) > parseFloat(balance.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    const formattedAmount = `${parseFloat(amount.toString()).toFixed(
      8,
    )} ${symbol}`;

    const fields = [
      { label: 'popup_html_transfer_amount', value: formattedAmount },
    ];

    if (operationType === TokenOperationType.DELEGATE) {
      fields.unshift({
        label: 'popup_html_transfer_to',
        value: `@${receiverUsername}`,
      });
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        `popup_html_${operationType}_tokens_confirm_text`,
      ),
      fields: fields,
      title: `popup_html_${operationType}_tokens`,
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList(
          `popup_html_${operationType}_tokens`,
          KeysUtils.getKeyType(
            activeAccount.keys.active!,
            activeAccount.keys.activePubkey!,
          ),
        );
        let tokenOperationResult: HiveEngineTransactionStatus;
        try {
          switch (operationType) {
            case TokenOperationType.DELEGATE:
              tokenOperationResult = await TokensUtils.delegateToken(
                receiverUsername,
                symbol,
                amount.toString(),
                activeAccount.keys.active!,
                activeAccount.name!,
              );
              break;
            case TokenOperationType.STAKE:
              tokenOperationResult = await TokensUtils.stakeToken(
                receiverUsername,
                symbol,
                amount.toString(),
                activeAccount.keys.active!,
                activeAccount.name!,
              );
              break;
            case TokenOperationType.UNSTAKE:
              tokenOperationResult = await TokensUtils.unstakeToken(
                symbol,
                amount.toString(),
                activeAccount.keys.active!,
                activeAccount.name!,
              );
              break;
          }

          if (tokenOperationResult && tokenOperationResult.broadcasted) {
            addToLoadingList('html_popup_confirm_transaction_operation');
            removeFromLoadingList(`popup_html_${operationType}_tokens`);
            removeFromLoadingList('html_popup_confirm_transaction_operation');
            if (tokenOperationResult.confirmed) {
              await FavoriteUserUtils.saveFavoriteUser(
                receiverUsername,
                activeAccount,
              );
              setSuccessMessage(`popup_html_${operationType}_tokens_success`);
              navigateTo(Screen.HOME_PAGE, true);
            } else {
              setErrorMessage('popup_token_timeout');
            }
          } else {
            removeFromLoadingList(`popup_html_${operationType}_tokens`);
            setErrorMessage(`popup_html_${operationType}_tokens_failed`);
          }
        } catch (err: any) {
          setErrorMessage(err.message, [err]);
        } finally {
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList(`popup_html_${operationType}_tokens`);
        }
      },
    });
  };

  const getSubmitButtonLabel = () => {
    switch (operationType) {
      case TokenOperationType.DELEGATE:
        return 'popup_html_token_delegate';
      case TokenOperationType.STAKE:
        return 'popup_html_token_stake';
      case TokenOperationType.UNSTAKE:
        return 'popup_html_token_unstake';
      default:
        return 'popup_html_send_transfer';
    }
  };

  return (
    <div aria-label="tokens-operation-page" className="transfer-tokens-page">
      <SummaryPanelComponent
        bottom={balance}
        bottomRight={symbol}
        bottomLeft={'popup_html_balance'}></SummaryPanelComponent>
      <div className="disclaimer">
        {chrome.i18n.getMessage('popup_html_tokens_operation_text')}
      </div>
      {operationType === TokenOperationType.UNSTAKE &&
        tokenInfo.unstakingCooldown > 0 && (
          <div className="cooldown-message">
            {chrome.i18n.getMessage(
              'popup_html_token_unstake_cooldown_disclaimer',
              [tokenInfo.unstakingCooldown.toString()],
            )}
          </div>
        )}
      {operationType === TokenOperationType.DELEGATE && (
        <InputComponent
          ariaLabel="input-username"
          type={InputType.TEXT}
          logo={Icons.AT}
          placeholder="popup_html_username"
          value={receiverUsername}
          onChange={setReceiverUsername}
          autocompleteValues={autocompleteFavoriteUsers}
        />
      )}
      <div className="value-panel">
        <div className="value-input-panel">
          <InputComponent
            ariaLabel="amount-input"
            type={InputType.NUMBER}
            placeholder="0.000"
            skipPlaceholderTranslation={true}
            value={amount}
            onChange={setAmount}
            onSetToMaxClicked={setAmountToMaxValue}
          />
        </div>
        <div className="symbol">{symbol}</div>
      </div>
      <OperationButtonComponent
        ariaLabel={`token-button-operation-${operationType}`}
        requiredKey={KeychainKeyTypesLC.active}
        label={getSubmitButtonLabel()}
        onClick={handleClickOnSend}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    tokenBalance: state.navigation.stack[0].params
      ?.tokenBalance as TokenBalance,
    tokenInfo: state.navigation.stack[0].params.tokenInfo as Token,
    operationType: state.navigation.stack[0].params
      ?.operationType as TokenOperationType,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    phishing: state.phishing,
    localAccounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  goBack,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensOperationComponent = connector(TokensOperation);

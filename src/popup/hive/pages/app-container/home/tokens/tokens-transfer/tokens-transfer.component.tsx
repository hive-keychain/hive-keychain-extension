import AccountUtils from '@hiveapp/utils/account.utils';
import CurrencyUtils from '@hiveapp/utils/currency.utils';
import { FavoriteUserUtils } from '@hiveapp/utils/favorite-user.utils';
import HiveUtils from '@hiveapp/utils/hive.utils';
import { KeysUtils } from '@hiveapp/utils/keys.utils';
import TokensUtils from '@hiveapp/utils/tokens.utils';
import TransferUtils from '@hiveapp/utils/transfer.utils';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { Icons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SummaryPanelComponent } from 'src/common-ui/summary-panel/summary-panel.component';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from 'src/popup/hive/actions/navigation.actions';
import { fetchPhishingAccounts } from 'src/popup/hive/actions/phishing.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import { Screen } from 'src/reference-data/screen.enum';
import './tokens-transfer.component.scss';

const TokensTransfer = ({
  activeAccount,
  tokenBalance,
  tokenInfo,
  phishing,
  formParams,
  localAccounts,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [receiverUsername, setReceiverUsername] = useState(
    formParams.receiverUsername ? formParams.receiverUsername : '',
  );
  const [amount, setAmount] = useState(
    formParams.amount ? formParams.amount : '',
  );

  const balance = formParams.balance
    ? formParams.balance
    : tokenBalance.balance;
  const symbol = formParams.symbol ? formParams.symbol : tokenBalance.symbol;

  const [memo, setMemo] = useState(formParams.memo ? formParams.memo : '');
  const [autocompleteFavoriteUsers, setAutocompleteFavoriteUsers] =
    useState<AutoCompleteValues>({ categories: [] });

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_transfer_tokens',
      isBackButtonEnabled: true,
    });
    fetchPhishingAccounts();
    loadAutocompleteTransferUsernames();
  }, []);

  const loadAutocompleteTransferUsernames = async () => {
    setAutocompleteFavoriteUsers(
      await FavoriteUserUtils.getAutocompleteListByCategories(
        activeAccount.name!,
        localAccounts,
      ),
    );
  };

  const setAmountToMaxValue = () => {
    setAmount(balance.toString());
  };

  const getFormParams = () => {
    return {
      receiverUsername: receiverUsername,
      amount: amount,
      symbol: symbol,
      balance: balance,
      memo: memo,
    };
  };

  const handleClickOnSend = async () => {
    if (
      String(receiverUsername).trim().length === 0 ||
      amount.toString().trim().length === 0
    ) {
      setErrorMessage('popup_accounts_fill');
      return;
    }

    if (parseFloat(amount.toString()) < 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(amount.toString()) > parseFloat(balance.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    if (!(await AccountUtils.doesAccountExist(receiverUsername))) {
      setErrorMessage('popup_no_such_account');
      return;
    }

    const formattedAmount = `${parseFloat(amount.toString()).toFixed(
      tokenInfo.precision,
    )} ${symbol}`;

    let memoField = memo;
    if (memo.length) {
      if (memo.startsWith('#')) {
        memoField = `${memo} (${chrome.i18n.getMessage('popup_encrypted')})`;
        if (!activeAccount.keys.memo) {
          setErrorMessage('popup_html_memo_key_missing');
          return;
        }
      }
    } else {
      memoField = chrome.i18n.getMessage('popup_empty');
    }

    const fields = [
      { label: 'popup_html_transfer_from', value: `@${activeAccount.name}` },
      { label: 'popup_html_transfer_to', value: `@${receiverUsername}` },
      { label: 'popup_html_transfer_amount', value: formattedAmount },
      { label: 'popup_html_transfer_memo', value: memoField },
    ];

    let warningMessage = await TransferUtils.getExchangeValidationWarning(
      receiverUsername,
      symbol,
      memo.length > 0,
    );

    if (phishing.includes(receiverUsername)) {
      warningMessage = chrome.i18n.getMessage('popup_warning_phishing', [
        receiverUsername,
      ]);
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('popup_html_token_confirm_text'),
      fields: fields,
      warningMessage: warningMessage,
      title: 'popup_html_transfer_tokens',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        try {
          let memoParam = memo;
          if (memo.length) {
            if (memo.startsWith('#')) {
              if (!activeAccount.keys.memo) {
                setErrorMessage('popup_html_memo_key_missing');
                return;
              } else {
                memoParam = HiveUtils.encodeMemo(
                  memo,
                  activeAccount.keys.memo.toString(),
                  await AccountUtils.getPublicMemo(receiverUsername),
                );
              }
            }
          }

          addToLoadingList(
            'html_popup_transfer_token_operation',
            KeysUtils.getKeyType(
              activeAccount.keys.active!,
              activeAccount.keys.activePubkey!,
            ),
          );
          const transactionStatus = await TokensUtils.sendToken(
            symbol,
            receiverUsername,
            amount,
            memoParam,
            activeAccount.keys.active!,
            activeAccount.name!,
          );
          if (transactionStatus.broadcasted) {
            addToLoadingList('html_popup_confirm_transaction_operation');
            removeFromLoadingList('html_popup_transfer_token_operation');

            if (transactionStatus.confirmed) {
              navigateTo(Screen.HOME_PAGE, true);
              await FavoriteUserUtils.saveFavoriteUser(
                receiverUsername,
                activeAccount,
              );

              setSuccessMessage('popup_html_transfer_successful', [
                `@${receiverUsername}`,
                formattedAmount,
              ]);
            } else {
              setErrorMessage('popup_token_timeout');
            }
          } else {
            setErrorMessage('popup_html_transfer_failed');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_transfer_token_operation');
          removeFromLoadingList('html_popup_confirm_transaction_operation');
        }
      },
    });
  };

  return (
    <div
      data-testid={`${Screen.TOKENS_TRANSFER}-page`}
      className="transfer-tokens-page">
      <SummaryPanelComponent
        bottom={balance}
        bottomRight={symbol}
        bottomLeft={'popup_html_balance'}></SummaryPanelComponent>

      <div className="disclaimer">
        {chrome.i18n.getMessage('popup_html_tokens_send_text')}
      </div>
      <InputComponent
        dataTestId="input-username"
        type={InputType.TEXT}
        logo={Icons.AT}
        placeholder="popup_html_username"
        value={receiverUsername}
        onChange={setReceiverUsername}
        autocompleteValues={autocompleteFavoriteUsers}
      />
      <div className="value-panel">
        <div className="value-input-panel">
          <InputComponent
            dataTestId="amount-input"
            type={InputType.NUMBER}
            placeholder="0.000"
            skipPlaceholderTranslation={true}
            value={amount}
            onChange={setAmount}
            rightActionClicked={setAmountToMaxValue}
          />
        </div>
        <div className="symbol">{symbol}</div>
      </div>

      <InputComponent
        dataTestId="input-memo-optional"
        type={InputType.TEXT}
        placeholder="popup_html_memo_optional"
        value={memo}
        onChange={setMemo}
      />
      <OperationButtonComponent
        dataTestId="button-send-tokens-transfer"
        requiredKey={KeychainKeyTypesLC.active}
        label={'popup_html_send_transfer'}
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
    tokenInfo: state.navigation.stack[0].params?.tokenInfo as Token,
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensTransferComponent = connector(TokensTransfer);

import { TokenBalance } from '@interfaces/tokens.interface';
import { TransferToItems } from '@interfaces/transfer-to-username.interface';
import { setLoading } from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { fetchPhishingAccounts } from '@popup/actions/phishing.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import BlockchainTransactionUtils from 'src/utils/tokens.utils';
import TransferUtils from 'src/utils/transfer.utils';
import './tokens-transfer.component.scss';

const TokensTransfer = ({
  activeAccount,
  token,
  phishing,
  formParams,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  setLoading,
}: PropsFromRedux) => {
  const [receiverUsername, setReceiverUsername] = useState(
    formParams.receiverUsername ? formParams.receiverUsername : '',
  );
  const [amount, setAmount] = useState(
    formParams.amount ? formParams.amount : '',
  );

  const balance = formParams.balance ? formParams.balance : token.balance;
  const symbol = formParams.symbol ? formParams.symbol : token.symbol;

  const [memo, setMemo] = useState(formParams.memo ? formParams.memo : '');
  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState<string[]>([]);

  useEffect(() => {
    fetchPhishingAccounts();
    loadAutocompleteTransferUsernames();
  }, []);

  const loadAutocompleteTransferUsernames = async () => {
    const transferTo: TransferToItems =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.TRANSFER_TO_USERNAMES,
      );
    setAutocompleteTransferUsernames(
      transferTo ? transferTo[activeAccount.name!] : [],
    );
  };

  const setAmountToMaxValue = () => {
    setAmount(parseFloat(balance.toString()));
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
    if (!(await AccountUtils.doesAccountExist(receiverUsername))) {
      setErrorMessage('popup_no_such_account');
      return;
    }

    if (parseFloat(amount.toString()) > parseFloat(balance.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    const formattedAmount = `${parseFloat(amount.toString()).toFixed(
      3,
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
      message: chrome.i18n.getMessage('popup_html_transfer_confirm_text'),
      fields: fields,
      warningMessage: warningMessage,
      formParams: getFormParams(),
      afterConfirmAction: async () => {
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

        const json = {
          contractName: 'tokens',
          contractAction: 'transfer',
          contractPayload: {
            symbol: symbol,
            to: receiverUsername,
            quantity: amount,
            memo: memo,
          },
        };

        setLoading(true);
        let sendTokenResult: any = await HiveUtils.sendCustomJson(
          json,
          activeAccount,
        );

        if (sendTokenResult.id) {
          let confirmationResult: any =
            await BlockchainTransactionUtils.tryConfirmTransaction(
              sendTokenResult.id,
            );
          setLoading(false);
          if (confirmationResult.confirmed) {
            navigateTo(Screen.HOME_PAGE, true);
            await TransferUtils.saveTransferRecipient(
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
          setLoading(false);
          setErrorMessage('popup_html_transfer_failed');
        }
      },
    });
  };

  return (
    <div className="transfer-funds-page">
      <PageTitleComponent
        title="popup_html_transfer_funds"
        isBackButtonEnabled={true}
      />
      <div className="balance-panel">
        <div className="balance-label">
          {chrome.i18n.getMessage('popup_html_balance', symbol)}
        </div>
        <div className="balance-value">{balance}</div>
      </div>

      <div className="disclaimer">
        {chrome.i18n.getMessage('popup_html_tokens_send_text')}
      </div>
      <InputComponent
        type={InputType.TEXT}
        logo={Icons.AT}
        placeholder="popup_html_username"
        value={receiverUsername}
        onChange={setReceiverUsername}
        autocompleteValues={autocompleteTransferUsernames}
      />
      <div className="value-panel">
        <div className="value-input-panel">
          <InputComponent
            type={InputType.NUMBER}
            placeholder="0.000"
            skipTranslation={true}
            value={amount}
            onChange={setAmount}
          />
          <div className="max" onClick={setAmountToMaxValue}>
            {chrome.i18n.getMessage('popup_html_send_max')}
          </div>
        </div>
        <div className="symbol">{symbol}</div>
      </div>

      <InputComponent
        type={InputType.TEXT}
        placeholder="popup_html_memo_optional"
        value={memo}
        onChange={setMemo}
      />
      <ButtonComponent
        label={'popup_html_send_transfer'}
        onClick={handleClickOnSend}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    token: state.navigation.stack[0].params?.token as TokenBalance,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    phishing: state.phishing,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  setLoading,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensTransferComponent = connector(TokensTransfer);

import { TransferToItems } from '@interfaces/transfer-to-username.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
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
import { AvailableCurrentPanelComponent } from '@popup/pages/app-container/home/power-up-down/available-current-panel/available-current-panel.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { CurrencyListItem } from 'src/interfaces/list-item.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import CurrencyUtils, { CurrencyLabels } from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import TransferUtils from 'src/utils/transfer.utils';
import './transfer-fund.component.scss';

const TransferFunds = ({
  activeAccount,
  navParams,
  currencyLabels,
  phishing,
  formParams,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const [receiverUsername, setReceiverUsername] = useState(
    formParams.receiverUsername ? formParams.receiverUsername : '',
  );
  const [amount, setAmount] = useState(
    formParams.amount ? formParams.amount : '',
  );
  const [balance, setBalance] = useState<string | number>('...');
  const [selectedCurrency, setSelectedCurrency] = useState<
    keyof CurrencyLabels
  >(
    formParams.selectedCurrency
      ? formParams.selectedCurrency
      : navParams.selectedCurrency,
  );
  const [memo, setMemo] = useState(formParams.memo ? formParams.memo : '');
  const [isRecurrent, setIsRecurrent] = useState(
    formParams.isRecurrent ? formParams.isRecurrent : false,
  );
  const [frequency, setFrequency] = useState(
    formParams.frequency ? formParams.frequency : '',
  );
  const [iteration, setIterations] = useState(
    formParams.iteration ? formParams.iteration : '',
  );
  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState<string[]>([]);

  let balances = {
    hive: FormatUtils.toNumber(activeAccount.account.balance),
    hbd: FormatUtils.toNumber(activeAccount.account.hbd_balance),
    hp: 0,
  };

  useEffect(() => {
    fetchPhishingAccounts();
    loadAutocompleteTransferUsernames();
  }, []);

  useEffect(() => {
    setBalance(balances[selectedCurrency]);
  }, [selectedCurrency]);

  const options = [
    { label: currencyLabels.hive, value: 'hive' as keyof CurrencyLabels },
    { label: currencyLabels.hbd, value: 'hbd' as keyof CurrencyLabels },
  ];

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
      selectedCurrency: selectedCurrency,
      memo: memo,
      isRecurrent: isRecurrent,
      iteration: iteration,
      frequency: frequency,
    };
  };

  const handleClickOnSend = async () => {
    if (parseFloat(amount.toString()) > parseFloat(balance.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    const formattedAmount = `${parseFloat(amount.toString()).toFixed(3)} ${
      currencyLabels[selectedCurrency]
    }`;

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

    if (isRecurrent) {
      fields.push({
        label: 'popup_html_transfer_recurrence',
        value: chrome.i18n.getMessage('popup_html_transfer_recurrence_value', [
          frequency,
          iteration,
        ]),
      });
    }

    let warningMessage = await TransferUtils.getExchangeValidationWarning(
      receiverUsername,
      currencyLabels[selectedCurrency],
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
      title: 'popup_html_transfer_funds',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_transfer_fund_operation');
        let success = false;
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

        success = await HiveUtils.transfer(
          activeAccount.name!,
          receiverUsername,
          formattedAmount,
          memoParam,
          isRecurrent,
          parseInt(iteration.toString()),
          parseInt(frequency.toString()),
        );

        removeFromLoadingList('html_popup_transfer_fund_operation');

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          await TransferUtils.saveTransferRecipient(
            receiverUsername,
            activeAccount,
          );

          if (!isRecurrent) {
            setSuccessMessage('popup_html_transfer_successful', [
              `@${receiverUsername}`,
              formattedAmount,
            ]);
          } else {
            setSuccessMessage('popup_html_transfer_recurrent_successful', [
              `@${receiverUsername}`,
              formattedAmount,
              frequency,
              iteration,
            ]);
          }
        } else {
          setErrorMessage('popup_html_transfer_failed');
        }
      },
    });
  };

  const customLabelRender = (selectProps: SelectRenderer<CurrencyListItem>) => {
    return (
      <div
        className="selected-currency"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {currencyLabels[selectedCurrency]}
      </div>
    );
  };
  const customItemRender = (
    selectProps: SelectItemRenderer<CurrencyListItem>,
  ) => {
    return (
      <div
        className={`select-account-item ${
          selectedCurrency === selectProps.item.value ? 'selected' : ''
        }`}
        onClick={() => {
          setSelectedCurrency(selectProps.item.value);
          selectProps.methods.dropDown('close');
        }}>
        <div className="currency">{selectProps.item.label}</div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageTitleComponent
        title="popup_html_transfer_funds"
        isBackButtonEnabled={true}
      />
      <div className="transfer-funds-page">
        <AvailableCurrentPanelComponent
          available={balance}
          availableCurrency={currencyLabels[selectedCurrency]}
          availableLabel={'popup_html_balance'}
        />
        <div className="form-container">
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
                min={0}
                onChange={setAmount}
                onSetToMaxClicked={setAmountToMaxValue}
              />
            </div>
            <Select
              values={[]}
              options={options}
              onChange={() => undefined}
              contentRenderer={customLabelRender}
              itemRenderer={customItemRender}
              className="select-currency"
            />
          </div>

          <InputComponent
            type={InputType.TEXT}
            placeholder="popup_html_memo_optional"
            value={memo}
            onChange={setMemo}
          />

          <CheckboxComponent
            title="popup_html_recurrent_transfer"
            checked={isRecurrent}
            onChange={setIsRecurrent}></CheckboxComponent>
          {isRecurrent && (
            <div className="recurrent-panel">
              <InputComponent
                type={InputType.NUMBER}
                placeholder="popup_html_recurrent_transfer_frequency"
                min={24}
                step={1}
                value={frequency}
                onChange={setFrequency}
                hint={'popup_html_recurrent_transfer_frequency_hint'}
              />
              <InputComponent
                type={InputType.NUMBER}
                placeholder="popup_html_recurrent_transfer_iterations"
                min={2}
                step={1}
                value={iteration}
                onChange={setIterations}
                hint={'popup_html_recurrent_transfer_iterations_hint'}
              />
            </div>
          )}
          <ButtonComponent
            label={'popup_html_send_transfer'}
            onClick={handleClickOnSend}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    navParams: state.navigation.stack[0].params,
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
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TransferFundsComponent = connector(TransferFunds);

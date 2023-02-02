import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
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
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { AvailableCurrentPanelComponent } from '@popup/pages/app-container/home/power-up-down/available-current-panel/available-current-panel.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { CurrencyListItem } from 'src/interfaces/list-item.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import CurrencyUtils, { CurrencyLabels } from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
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
  setTitleContainerProperties,
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
    setTitleContainerProperties({
      title: 'popup_html_transfer_funds',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    setBalance(balances[selectedCurrency]);
  }, [selectedCurrency]);

  const options = [
    { label: currencyLabels.hive, value: 'hive' as keyof CurrencyLabels },
    { label: currencyLabels.hbd, value: 'hbd' as keyof CurrencyLabels },
  ];

  const loadAutocompleteTransferUsernames = async () => {
    const favoriteUsers: FavoriteUserItems =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.FAVORITE_USERS,
      );
    setAutocompleteTransferUsernames(
      favoriteUsers ? favoriteUsers[activeAccount.name!] : [],
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
    if (!amount || !receiverUsername || receiverUsername.trim().length === 0) {
      setErrorMessage('popup_html_fill_form_error');
      return;
    }

    if (amount <= 0 && !isRecurrent) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

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

    let fields = [
      { label: 'popup_html_transfer_from', value: `@${activeAccount.name}` },
      { label: 'popup_html_transfer_to', value: `@${receiverUsername}` },
      { label: 'popup_html_transfer_amount', value: formattedAmount },
      { label: 'popup_html_transfer_memo', value: memoField },
    ];

    const isCancelRecurrent = parseFloat(amount) === 0 && isRecurrent;

    if (
      isRecurrent &&
      !isCancelRecurrent &&
      (!frequency ||
        frequency.length === 0 ||
        !iteration ||
        iteration.length === 0)
    ) {
      setErrorMessage('popup_html_transfer_recurrent_missing_field');
      return;
    }

    if (isRecurrent && !isCancelRecurrent) {
      fields.push({
        label: 'popup_html_transfer_recurrence',
        value: chrome.i18n.getMessage('popup_html_transfer_recurrence_value', [
          frequency,
          iteration,
        ]),
      });
    }
    if (isCancelRecurrent) {
      fields = [fields[0], fields[1]];
    }

    let warningMessage = await TransferUtils.getExchangeValidationWarning(
      receiverUsername,
      currencyLabels[selectedCurrency],
      memo.length > 0,
      isRecurrent,
    );

    if (phishing.includes(receiverUsername)) {
      warningMessage = chrome.i18n.getMessage('popup_warning_phishing', [
        receiverUsername,
      ]);
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        isCancelRecurrent
          ? 'popup_html_transfer_confirm_cancel_recurrent'
          : 'popup_html_transfer_confirm_text',
      ),
      fields: fields,
      warningMessage: warningMessage,
      skipWarningTranslation: true,
      title: isCancelRecurrent
        ? 'popup_html_cancel_recurrent_transfer'
        : 'popup_html_transfer_funds',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList(
          'html_popup_transfer_fund_operation',
          KeysUtils.getKeyType(
            activeAccount.keys.active!,
            activeAccount.keys.activePubkey!,
          ),
        );
        try {
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

          success = await TransferUtils.sendTransfer(
            activeAccount.name!,
            receiverUsername,
            formattedAmount,
            memoParam,
            isRecurrent,
            isCancelRecurrent ? 2 : +iteration,
            isCancelRecurrent ? 24 : +frequency,
            activeAccount.keys.active!,
          );

          removeFromLoadingList('html_popup_transfer_fund_operation');

          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            await TransferUtils.saveFavoriteUser(
              receiverUsername,
              activeAccount,
            );

            if (!isRecurrent) {
              setSuccessMessage('popup_html_transfer_successful', [
                `@${receiverUsername}`,
                formattedAmount,
              ]);
            } else {
              isCancelRecurrent
                ? setSuccessMessage(
                    'popup_html_cancel_transfer_recurrent_successful',
                    [`@${receiverUsername}`],
                  )
                : setSuccessMessage(
                    'popup_html_transfer_recurrent_successful',
                    [
                      `@${receiverUsername}`,
                      formattedAmount,
                      frequency,
                      iteration,
                    ],
                  );
            }
          } else {
            setErrorMessage('popup_html_transfer_failed');
          }
        } catch (err: any) {
          Logger.error(err);
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_transfer_fund_operation');
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
    <>
      <div className="transfer-funds-page" aria-label="transfer-funds-page">
        <AvailableCurrentPanelComponent
          available={balance}
          availableCurrency={currencyLabels[selectedCurrency]}
          availableLabel={'popup_html_balance'}
        />
        <div className="form-container">
          <InputComponent
            ariaLabel="input-username"
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
                ariaLabel="amount-input"
                type={InputType.NUMBER}
                placeholder="0.000"
                skipPlaceholderTranslation={true}
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
            ariaLabel="input-memo-optional"
            type={InputType.TEXT}
            placeholder="popup_html_memo_optional"
            value={memo}
            onChange={setMemo}
          />
          {memo.length}
          <CheckboxComponent
            ariaLabel="checkbox-transfer-recurrent"
            title={
              parseFloat(amount) === 0
                ? 'popup_html_cancel_recurrent_transfer'
                : 'popup_html_recurrent_transfer'
            }
            checked={isRecurrent}
            onChange={setIsRecurrent}></CheckboxComponent>
          {isRecurrent && parseFloat(amount) !== 0 && (
            <div className="recurrent-panel">
              <InputComponent
                ariaLabel="input-recurrent-frecuency"
                type={InputType.NUMBER}
                placeholder="popup_html_recurrent_transfer_frequency"
                min={24}
                step={1}
                value={frequency}
                onChange={setFrequency}
                hint={'popup_html_recurrent_transfer_frequency_hint'}
              />
              <InputComponent
                ariaLabel="input-recurrent-iterations"
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
          <OperationButtonComponent
            ariaLabel="send-transfer"
            requiredKey={KeychainKeyTypesLC.active}
            onClick={handleClickOnSend}
            label={'popup_html_send_transfer'}
          />
        </div>
      </div>
    </>
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
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TransferFundsComponent = connector(TransferFunds);

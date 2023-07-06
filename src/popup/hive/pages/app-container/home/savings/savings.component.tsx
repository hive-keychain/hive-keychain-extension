import CurrencyUtils, { CurrencyLabels } from '@hiveapp/utils/currency.utils';
import { FavoriteUserUtils } from '@hiveapp/utils/favorite-user.utils';
import { SavingsUtils } from '@hiveapp/utils/savings.utils';
import TransferUtils from '@hiveapp/utils/transfer.utils';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { SavingsWithdrawal } from '@interfaces/savings.interface';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { Icons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SummaryPanelComponent } from 'src/common-ui/summary-panel/summary-panel.component';
import { CurrencyListItem } from 'src/interfaces/list-item.interface';
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
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import { SavingOperationType } from 'src/popup/hive/pages/app-container/home/savings/savings-operation-type.enum';
import { RootState } from 'src/popup/hive/store';
import { Screen } from 'src/reference-data/screen.enum';
import FormatUtils from 'src/utils/format.utils';
import './savings.component.scss';

const SavingsPage = ({
  currencyLabels,
  paramsSelectedCurrency,
  activeAccount,
  globalProperties,
  formParams,
  localAccounts,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [username, setUsername] = useState(
    formParams.username ? formParams.username : activeAccount.name!,
  );
  const [text, setText] = useState('');
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : 0,
  );
  const [savings, setSavings] = useState<string | number>('...');
  const [liquid, setLiquid] = useState<string | number>('...');
  const [savingsPendingWithdrawalList, setSavingsPendingWithdrawalList] =
    useState<SavingsWithdrawal[]>([]);
  const [totalPendingValue, setTotalPendingValue] = useState<
    number | undefined
  >();
  const [autocompleteFavoriteUsers, setAutocompleteFavoriteUsers] =
    useState<AutoCompleteValues>({ categories: [] });

  const [selectedSavingOperationType, setSelectedSavingOperationType] =
    useState<SavingOperationType>(
      formParams.selectedSavingOperationType
        ? (formParams.selectedSavingOperationType as SavingOperationType)
        : SavingOperationType.DEPOSIT,
    );
  const [selectedCurrency, setSelectedCurrency] = useState<
    keyof CurrencyLabels
  >(
    formParams.selectedCurrency
      ? formParams.selectedCurrency
      : paramsSelectedCurrency,
  );
  const currency = currencyLabels[selectedCurrency];

  const currencyOptions = [
    { label: currencyLabels.hive, value: 'hive' as keyof CurrencyLabels },
    { label: currencyLabels.hbd, value: 'hbd' as keyof CurrencyLabels },
  ];
  const savingOperationTypeOptions = [
    {
      label: chrome.i18n.getMessage(SavingOperationType.WITHDRAW),
      value: SavingOperationType.WITHDRAW as string,
    },
    {
      label: chrome.i18n.getMessage(SavingOperationType.DEPOSIT),
      value: SavingOperationType.DEPOSIT as string,
    },
  ];

  useEffect(() => {
    loadAutocompleteFavoriteUsers();
    setTitleContainerProperties({
      title: 'popup_html_savings',
      isBackButtonEnabled: true,
      titleParams: [currency],
    });
  }, [currency]);

  useEffect(() => {
    if (activeAccount.account.savings_withdraw_requests > 0) {
      fetchCurrentWithdrawingList();
    }
    const hbdSavings = FormatUtils.toNumber(
      activeAccount.account.savings_hbd_balance,
    );
    const hiveSavings = FormatUtils.toNumber(
      activeAccount.account.savings_balance,
    );
    const hbd = FormatUtils.toNumber(activeAccount.account.hbd_balance);
    const hive = FormatUtils.toNumber(activeAccount.account.balance);

    setLiquid(selectedCurrency === 'hive' ? hive : hbd);
    setSavings(selectedCurrency === 'hive' ? hiveSavings : hbdSavings);
  }, [selectedCurrency]);

  useEffect(() => {
    let text = '';
    if (selectedSavingOperationType === SavingOperationType.DEPOSIT) {
      if (selectedCurrency === 'hbd') {
        text = chrome.i18n.getMessage('popup_html_deposit_hbd_text', [
          Number(globalProperties.globals?.hbd_interest_rate) / 100 + '',
        ]);
      }
    } else {
      text = chrome.i18n.getMessage('popup_html_withdraw_text');
    }
    setText(text);
  }, [selectedCurrency, selectedSavingOperationType]);

  const fetchCurrentWithdrawingList = async () => {
    const savingsPendingWithdrawalList =
      await SavingsUtils.getSavingsWithdrawals(activeAccount.name!);

    const totalPendingValue = filterSavingsPendingWithdrawalList(
      savingsPendingWithdrawalList,
      currency,
    ).reduce((acc, curr) => acc + parseFloat(curr.amount.split(' ')[0]), 0);
    setTotalPendingValue(
      totalPendingValue !== 0 ? totalPendingValue : undefined,
    );

    setSavingsPendingWithdrawalList(
      filterSavingsPendingWithdrawalList(
        savingsPendingWithdrawalList,
        currency,
      ),
    );
  };

  const loadAutocompleteFavoriteUsers = async () => {
    setAutocompleteFavoriteUsers(
      await FavoriteUserUtils.getAutocompleteListByCategories(
        activeAccount.name!,
        localAccounts,
      ),
    );
  };

  const handleButtonClick = () => {
    if (
      (selectedSavingOperationType === SavingOperationType.DEPOSIT &&
        parseFloat(value.toString()) > parseFloat(liquid.toString())) ||
      (selectedSavingOperationType === SavingOperationType.WITHDRAW &&
        parseFloat(value.toString()) > parseFloat(savings.toString()))
    ) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    let operationString = chrome.i18n.getMessage(
      selectedSavingOperationType === SavingOperationType.WITHDRAW
        ? 'popup_html_withdraw_param'
        : 'popup_html_deposit_param',
      [currency],
    );

    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${currency}`;

    let warning = TransferUtils.getTransferFromToSavingsValidationWarning(
      username,
      selectedSavingOperationType,
    );

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        selectedSavingOperationType === SavingOperationType.WITHDRAW
          ? 'popup_html_confirm_savings_withdraw'
          : 'popup_html_confirm_savings_deposit',
        [currency],
      ),
      warningMessage: warning,
      skipWarningTranslation: true,
      title: operationString,
      skipTitleTranslation: true,
      fields: [
        { label: 'popup_html_value', value: valueS },
        { label: 'popup_html_username', value: `@${username}` },
      ],
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        try {
          let success;
          switch (selectedSavingOperationType) {
            case SavingOperationType.DEPOSIT:
              addToLoadingList('html_popup_deposit_to_savings_operation');
              success = await SavingsUtils.deposit(
                valueS,
                username,
                activeAccount.name!,
                activeAccount.keys.active!,
              );
              break;
            case SavingOperationType.WITHDRAW:
              addToLoadingList('html_popup_withdraw_from_savings_operation');
              success = await SavingsUtils.withdraw(
                valueS,
                username,
                activeAccount.name!,
                activeAccount.keys.active!,
              );
              break;
          }

          navigateTo(Screen.HOME_PAGE, true);
          if (success && success.confirmed) {
            await FavoriteUserUtils.saveFavoriteUser(username, activeAccount);
            setSuccessMessage(
              selectedSavingOperationType === SavingOperationType.DEPOSIT
                ? 'popup_html_deposit_success'
                : 'popup_html_withdraw_success',
              [`${value} ${selectedCurrency.toUpperCase()}`],
            );
          } else {
            setErrorMessage(
              selectedSavingOperationType === SavingOperationType.DEPOSIT
                ? 'popup_html_deposit_fail'
                : 'popup_html_withdraw_fail',
              [selectedCurrency.toUpperCase()],
            );
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_deposit_to_savings_operation');
          removeFromLoadingList('html_popup_withdraw_from_savings_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  const getFormParams = () => {
    return {
      username: username,
      value: value,
      selectedSavingOperationType: selectedSavingOperationType,
      selectedCurrency: selectedCurrency,
    };
  };

  const setToMax = () => {
    if (selectedSavingOperationType === SavingOperationType.WITHDRAW) {
      setValue(savings);
    } else {
      setValue(liquid);
    }
  };

  const customCurrencyLabelRender = (
    selectProps: SelectRenderer<CurrencyListItem>,
  ) => {
    return (
      <div
        data-testid="select-currency-savings"
        className="selected-value"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {currencyLabels[selectedCurrency]}
      </div>
    );
  };
  const customOperationTypeLabelRender = (selectProps: SelectRenderer<any>) => {
    return (
      <div
        data-testid="select-operation-type"
        className="selected-value"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {chrome.i18n.getMessage(selectedSavingOperationType)}
      </div>
    );
  };
  const customSavingOperationTimeItemRender = (
    selectProps: SelectItemRenderer<any>,
  ) => {
    return (
      <div
        data-testid={`select-operation-${selectProps.item.label}`}
        className={`select-account-item ${
          selectedSavingOperationType === selectProps.item.value
            ? 'selected'
            : ''
        }`}
        onClick={() => {
          setSelectedSavingOperationType(selectProps.item.value);
          selectProps.methods.dropDown('close');
        }}>
        <div className="currency">{selectProps.item.label}</div>
      </div>
    );
  };
  const customCurrencyItemRender = (
    selectProps: SelectItemRenderer<CurrencyListItem>,
  ) => {
    return (
      <div
        data-testid={`select-account-item-${selectProps.item.label}`}
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

  const goToPendingSavingsWithdrawal = () => {
    navigateToWithParams(Screen.PENDING_SAVINGS_WITHDRAWAL_PAGE, {
      savingsPendingWithdrawalList: filterSavingsPendingWithdrawalList(
        savingsPendingWithdrawalList,
        currency,
      ),
      currency,
    });
  };

  const filterSavingsPendingWithdrawalList = (
    pendinSavingsWidrawal: SavingsWithdrawal[],
    currency: string,
  ) => {
    return pendinSavingsWidrawal.filter(
      (pendingWithdrawItem) =>
        pendingWithdrawItem.amount.split(' ')[1] === currency,
    );
  };

  return (
    <div className="savings-page" data-testid={`${Screen.SAVINGS_PAGE}-page`}>
      <SummaryPanelComponent
        bottom={liquid}
        bottomRight={currency}
        bottomLeft={'popup_html_savings_available'}
        top={savings}
        topRight={currency}
        topLeft={'popup_html_savings_current'}
        center={totalPendingValue}
        centerLeft={'popup_html_savings_current_withdrawing'}
        centerRight={currency}
        onCenterPanelClick={goToPendingSavingsWithdrawal}
      />

      <Select
        values={[]}
        options={savingOperationTypeOptions}
        onChange={() => undefined}
        contentRenderer={customOperationTypeLabelRender}
        itemRenderer={customSavingOperationTimeItemRender}
        className="select-operation-type select-dropdown"
      />

      {text.length > 0 && <div className="text">{text}</div>}

      {
        <InputComponent
          dataTestId="input-username"
          type={InputType.TEXT}
          logo={Icons.AT}
          placeholder="popup_html_transfer_to"
          value={username}
          onChange={setUsername}
          autocompleteValues={autocompleteFavoriteUsers}
        />
      }
      <div className="amount-panel">
        <div className="amount-input-panel">
          <InputComponent
            dataTestId="amount-input"
            type={InputType.NUMBER}
            placeholder="0.000"
            skipPlaceholderTranslation={true}
            value={value}
            onChange={setValue}
            onSetToMaxClicked={setToMax}
          />
        </div>
        <Select
          values={[]}
          options={currencyOptions}
          onChange={() => undefined}
          contentRenderer={customCurrencyLabelRender}
          itemRenderer={customCurrencyItemRender}
          className="select-currency select-dropdown"
        />
      </div>

      <OperationButtonComponent
        dataTestId="submit-savings"
        requiredKey={KeychainKeyTypesLC.active}
        label={
          selectedSavingOperationType === SavingOperationType.WITHDRAW
            ? 'popup_html_withdraw_param'
            : 'popup_html_deposit_param'
        }
        labelParams={[currency]}
        onClick={() => handleButtonClick()}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    powerType: state.navigation.stack[0].params.powerType as PowerType,
    globalProperties: state.globalProperties,
    paramsSelectedCurrency: state.navigation.stack[0].params
      .selectedCurrency as keyof CurrencyLabels,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    localAccounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SavingsPageComponent = connector(SavingsPage);

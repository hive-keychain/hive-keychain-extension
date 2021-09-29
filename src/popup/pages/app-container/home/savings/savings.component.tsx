import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { AvailableCurrentPanelComponent } from '@popup/pages/app-container/home/power-up-down/power-up-down-top-panel/power-up-down-top-panel.component';
import { SavingOperationType } from '@popup/pages/app-container/home/savings/savings-operation-type.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { CurrencyListItem } from 'src/interfaces/list-item.interface';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils, { CurrencyLabels } from 'src/utils/currency.utils';
import HiveUtils from 'src/utils/hive.utils';
import './savings.component.scss';

const SavingsPage = ({
  currencyLabels,
  paramsSelectedCurrency,
  activeAccount,
  globalProperties,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  const [username, setUsername] = useState(activeAccount.name!);
  const [text, setText] = useState('');
  const [value, setValue] = useState<string | number>(0);
  const [current, setCurrent] = useState<string | number>('...');
  const [available, setAvailable] = useState<string | number>('...');

  const [selectedSavingOperationType, setSelectedSavingOperationType] =
    useState<string>(SavingOperationType.WITHDRAW);
  const [selectedCurrency, setSelectedCurrency] = useState<
    keyof CurrencyLabels
  >(paramsSelectedCurrency);

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
    const hbdSavings = activeAccount.account.savings_hbd_balance
      .toString()
      .split(' ')[0];
    const hiveSavings = activeAccount.account.savings_balance
      .toString()
      .split(' ')[0];

    const hbd = activeAccount.account.hbd_balance.toString().split(' ')[0];
    const hive = activeAccount.account.balance.toString().split(' ')[0];

    setAvailable(selectedCurrency === 'hive' ? hive : hbd);
    setCurrent(selectedCurrency === 'hive' ? hiveSavings : hbdSavings);
  }, [selectedCurrency]);

  useEffect(() => {
    let text = '';
    if (selectedSavingOperationType === SavingOperationType.DEPOSIT) {
      if (selectedCurrency === 'hbd') {
        text = chrome.i18n.getMessage(
          'popup_html_deposit_hbd_text',
          Number(globalProperties.globals?.hbd_interest_rate) / 100,
        );
      }
    } else {
      text = chrome.i18n.getMessage('popup_html_withdraw_text');
    }
    setText(text);
  }, [selectedCurrency, selectedSavingOperationType]);

  const currency = currencyLabels[selectedCurrency];

  const handleButtonClick = () => {
    if (parseFloat(value.toString()) > parseFloat(available.toString())) {
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

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_power_up_down_message',
        [operationString],
      ),
      fields: [{ label: 'popup_html_value', value: valueS }],
      afterConfirmAction: async () => {
        let success = false;

        switch (selectedSavingOperationType) {
          case SavingOperationType.DEPOSIT:
            success = await HiveUtils.deposit(activeAccount, valueS);
            break;
          case SavingOperationType.WITHDRAW:
            success = await HiveUtils.withdraw(activeAccount, valueS);
            break;
        }

        navigateTo(Screen.HOME_PAGE, true);
        if (success) {
          setSuccessMessage('popup_html_power_up_down_success', [
            operationString,
          ]);
        } else {
          setErrorMessage('popup_html_power_up_down_fail', [operationString]);
        }
      },
    });
  };

  const setToMax = () => {
    if (selectedSavingOperationType === SavingOperationType.WITHDRAW) {
      setValue(current);
    } else {
      setValue(available);
    }
  };

  const customCurrencyLabelRender = (
    selectProps: SelectRenderer<CurrencyListItem>,
  ) => {
    return (
      <div
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
        className={`select-account-item ${
          selectedSavingOperationType === selectProps.item.value
            ? 'selected'
            : ''
        }`}
        onClick={() => {
          setSelectedSavingOperationType(selectProps.item.value as string);
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
    <div className="savings-page">
      <PageTitleComponent
        title={'popup_html_savings'}
        titleParams={[currency]}
        isBackButtonEnabled={true}
      />
      <AvailableCurrentPanelComponent
        available={available}
        availableCurrency={currency}
        availableLabel={'popup_html_savings_available'}
        current={current}
        currentCurrency={currency}
        currentLabel={'popup_html_savings_current'}
      />

      <Select
        values={[]}
        options={savingOperationTypeOptions}
        onChange={() => undefined}
        contentRenderer={customOperationTypeLabelRender}
        itemRenderer={customSavingOperationTimeItemRender}
        className="select-operation-type select-dropdown"
      />

      <div className="text">{chrome.i18n.getMessage(text)}</div>

      <InputComponent
        type={InputType.TEXT}
        placeholder="popup_html_username"
        value={username}
        onChange={setUsername}
      />
      <div className="amount-panel">
        <div className="amount-input-panel">
          <InputComponent
            type={InputType.NUMBER}
            placeholder="0.000"
            skipTranslation={true}
            value={value}
            onChange={setValue}
          />
          <a className="max" onClick={() => setToMax()}>
            {chrome.i18n.getMessage('popup_html_send_max')}
          </a>
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

      <ButtonComponent
        label={
          selectedSavingOperationType === SavingOperationType.WITHDRAW
            ? 'popup_html_withdraw_param'
            : 'popup_html_deposit_param'
        }
        labelParams={[currency]}
        onClick={() => handleButtonClick()}
      />

      <ReactTooltip
        id="tooltip"
        place="top"
        type="light"
        effect="solid"
        multiline={true}
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
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SavingsPageComponent = connector(SavingsPage);

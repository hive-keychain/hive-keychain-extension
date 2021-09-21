import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { PowerUpDownTopPanelComponent } from '@popup/pages/app-container/home/power-up-down/power-up-down-top-panel/power-up-down-top-panel.component';
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
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './savings.component.scss';

const SavingsPage = ({
  currencyLabels,
  paramsSelectedCurrency,
  activeAccount,
  powerType,
  globalProperties,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  const [username, setUsername] = useState(activeAccount.name!);
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
      label: SavingOperationType.WITHDRAW,
      value: SavingOperationType.WITHDRAW as string,
    },
    {
      label: SavingOperationType.DEPOSIT,
      value: SavingOperationType.DEPOSIT as string,
    },
  ];

  useEffect(() => {
    const hiveBalance = FormatUtils.formatCurrencyValue(
      activeAccount.account.balance,
    );

    const hpBalance = FormatUtils.withCommas(
      (
        FormatUtils.toHP(
          activeAccount.account.vesting_shares.toString().replace('VESTS', ''),
          globalProperties.globals,
        ) - (powerType === PowerType.POWER_UP ? 0 : 5)
      ).toString(),
    );

    setAvailable(powerType === PowerType.POWER_UP ? hiveBalance : hpBalance);
    setCurrent(powerType === PowerType.POWER_UP ? hpBalance : hiveBalance);
  }, [activeAccount]);

  const currency = currencyLabels[selectedCurrency];

  const text =
    powerType === PowerType.POWER_UP
      ? 'popup_html_powerup_text'
      : 'popup_html_powerdown_text';

  const handleButtonClick = () => {
    if (
      powerType === PowerType.POWER_DOWN &&
      Number(value).toFixed(3) === '0.000'
    ) {
      return handleCancelButtonClick();
    }

    if (parseFloat(value.toString()) > parseFloat(available.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    const operationString = chrome.i18n
      .getMessage(
        powerType === PowerType.POWER_UP ? 'popup_html_pu' : 'popup_html_pd',
      )
      .toLowerCase();
    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${currency}`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_power_up_down_message',
        [operationString],
      ),
      fields: [
        { label: 'popup_html_operation', value: operationString },
        { label: 'popup_html_value', value: valueS },
      ],
      afterConfirmAction: async () => {
        let success = false;
        switch (powerType) {
          case PowerType.POWER_UP:
            success = await HiveUtils.powerUp(username, valueS);
            break;
          case PowerType.POWER_DOWN:
            success = await HiveUtils.powerDown(
              username,
              `${FormatUtils.fromHP(
                Number(value).toFixed(3),
                globalProperties.globals!,
              ).toFixed(6)} VESTS`,
            );
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
    setValue(available);
  };

  const handleCancelButtonClick = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_power_down_message',
      ),
      fields: [],
      afterConfirmAction: async () => {
        let success = false;
        navigateTo(Screen.HOME_PAGE, true);
        if (success) {
          setSuccessMessage('popup_html_cancel_power_down_success');
        } else {
          setErrorMessage('popup_html_cancel_power_down_fail');
        }
      },
    });
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
    console.log(selectProps);
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
      <PowerUpDownTopPanelComponent
        powerType={powerType}
        available={available}
        current={current}
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
        label={'popup_html_savings'}
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
    powerType: state.navigation.params.powerType as PowerType,
    globalProperties: state.globalProperties,
    paramsSelectedCurrency: state.navigation.params
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

import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { CurrencyListItem } from '@interfaces/list-item.interface';
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
  goBackTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { LeaseRequest } from '@popup/pages/app-container/home/lease-market/lease-market.interface';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import CurrencyUtils, {
  BaseCurrencies,
  CurrencyLabels,
} from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import { LeaseMarketUtils } from 'src/utils/lease-market.utils';
import { v4 as uuidv4 } from 'uuid';
import './create-lease-request-page.component.scss';

import { LeaseKeys } from 'hive-keychain-commons/lib/lease-market/lease-keys';

const CreateLeaseRequestPage = ({
  activeAccount,
  currencyLabels,
  globalProperties,
  setTitleContainerProperties,
  navigateToWithParams,
  setErrorMessage,
  setSuccessMessage,
  goBack,
  goBackTo,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const [leaseRequestForm, setLeaseRequestForm] = useState<LeaseRequest>({
    id: uuidv4(),
    delegationValue: 0,
    weeklyPay: 0,
    weeklyPayCurrency: BaseCurrencies.HIVE,
    duration: 0,
    totalCost: 0,
  });

  const options = [
    { label: currencyLabels.hive, value: 'hive' as keyof CurrencyLabels },
    { label: currencyLabels.hbd, value: 'hbd' as keyof CurrencyLabels },
  ];

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_lease_market',
      isBackButtonEnabled: true,
    });
  }, []);

  const updateForm = (newValue: any) => {
    setLeaseRequestForm({ ...leaseRequestForm, ...newValue });
  };

  const customLabelRender = (selectProps: SelectRenderer<CurrencyListItem>) => {
    return (
      <div
        className="selected-currency"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {currencyLabels[leaseRequestForm.weeklyPayCurrency]}
      </div>
    );
  };
  const customItemRender = (
    selectProps: SelectItemRenderer<CurrencyListItem>,
  ) => {
    return (
      <div
        className={`select-account-item ${
          leaseRequestForm.weeklyPayCurrency === selectProps.item.value
            ? 'selected'
            : ''
        }`}
        onClick={() => {
          updateForm({ weeklyPayCurrency: selectProps.item.value });
          selectProps.methods.dropDown('close');
        }}>
        <div className="currency">{selectProps.item.label}</div>
      </div>
    );
  };

  const submit = async () => {
    const leaseRequest = {
      key: LeaseKeys.REQUEST,
      ...leaseRequestForm,
      delegationValue: FormatUtils.fromHP(
        `${leaseRequestForm.delegationValue}`,
        globalProperties.globals!,
      ),
    };
    const totalAmount =
      parseFloat(leaseRequestForm.weeklyPay.toString()) *
      parseInt(leaseRequestForm.duration.toString());
    const formattedTotalAmount = `${totalAmount.toFixed(3)} ${
      currencyLabels[leaseRequestForm.weeklyPayCurrency]
    }`;

    leaseRequest.totalCost = totalAmount;

    if (leaseRequestForm.weeklyPay < 1) {
      setErrorMessage('popup_html_lease_market_weekly_payout_too_low');
      return;
    }
    if (leaseRequestForm.duration > 24) {
      setErrorMessage('popup_html_lease_market_duration_too_long');
      return;
    }

    console.log(totalAmount);

    if (leaseRequestForm.weeklyPayCurrency === BaseCurrencies.HBD) {
      if (
        parseFloat(activeAccount.account.hbd_balance.toString().split(' ')[0]) <
        totalAmount
      ) {
        setErrorMessage('popup_html_lease_market_unsuficient_funds');
        return;
      }
    }
    if (leaseRequestForm.weeklyPayCurrency === BaseCurrencies.HIVE) {
      if (
        parseFloat(activeAccount.account.balance.toString().split(' ')[0]) <
        totalAmount
      ) {
        setErrorMessage('popup_html_lease_market_unsuficient_funds');
        return;
      }
    }

    const delegationValueInHp = `${FormatUtils.formatCurrencyValue(
      leaseRequestForm.delegationValue,
    )} ${currencyLabels.hp}`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_transfer_confirm_delegation_lease_request_message',
      ),
      fields: [
        {
          label: 'popup_html_lease_market_requested_delegation',
          value: delegationValueInHp,
        },
        {
          label: 'popup_html_lease_market_weekly_payout',
          value: `${FormatUtils.formatCurrencyValue(
            leaseRequestForm.weeklyPay,
          )} ${currencyLabels[leaseRequestForm.weeklyPayCurrency]}`,
        },
        {
          label: 'popup_html_lease_market_duration',
          value: `${leaseRequestForm.duration} ${chrome.i18n.getMessage(
            leaseRequestForm.duration > 1 ? 'weeks' : 'week',
          )}`,
        },
        {
          label: 'popup_html_lease_market_total_cost',
          value: formattedTotalAmount,
        },
      ],
      title: 'popup_html_transfer_confirm_delegation_lease_request',
      formParams: leaseRequestForm,
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delegation_lease_request_operation');

        let success = await LeaseMarketUtils.createLeaseRequest(
          leaseRequest,
          formattedTotalAmount,
          activeAccount,
          delegationValueInHp,
        );

        removeFromLoadingList('html_popup_delegation_lease_request_operation');

        if (success) {
          setSuccessMessage('html_popup_delegation_lease_request_success');
          goBackTo(Screen.LEASE_MARKET);
        } else {
          setErrorMessage('html_popup_delegation_lease_request_failed');
          goBack();
        }
      },
    });
  };

  return (
    <div className="create-delegation-request-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_lease_market_request_introduction')}
      </div>
      <div className="form">
        <InputComponent
          onChange={(newValue) => updateForm({ delegationValue: newValue })}
          value={leaseRequestForm.delegationValue}
          label="popup_html_lease_market_requested_delegation"
          hint="popup_html_lease_market_delegation_value_hint"
          placeholder="0.000"
          skipPlaceholderTranslation
          type={InputType.NUMBER}
        />
        <InputComponent
          type={InputType.NUMBER}
          placeholder="0.000"
          label="popup_html_lease_market_weekly_payout"
          hint="popup_html_lease_market_weekly_payout_hint"
          skipPlaceholderTranslation
          value={leaseRequestForm.weeklyPay}
          min={1}
          onChange={(newValue) => updateForm({ weeklyPay: newValue })}
        />
        <Select
          values={[]}
          options={options}
          onChange={() => undefined}
          contentRenderer={customLabelRender}
          itemRenderer={customItemRender}
          className="select-dropdown"
        />
        <InputComponent
          type={InputType.NUMBER}
          placeholder="0"
          label="popup_html_lease_market_duration"
          skipPlaceholderTranslation
          hint="popup_html_lease_market_duration_hint"
          onChange={(newValue) => updateForm({ duration: newValue })}
          max={24}
          value={leaseRequestForm.duration}
        />

        <OperationButtonComponent
          label="popup_html_submit"
          onClick={() => submit()}
          requiredKey={KeychainKeyTypesLC.active}
          fixToBottom
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(
      state.activeRpc?.testnet!,
    ) as CurrencyLabels,
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
  setErrorMessage,
  setSuccessMessage,
  goBack,
  goBackTo,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const CreateLeaseRequestPageComponent = connector(
  CreateLeaseRequestPage,
);

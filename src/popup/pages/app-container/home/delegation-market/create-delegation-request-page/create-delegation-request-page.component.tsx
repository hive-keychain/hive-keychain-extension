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
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
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
import { LeaseKeys } from 'src/utils/delegation-market.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import { v4 as uuidv4 } from 'uuid';
import './create-delegation-request-page.component.scss';

const KEYCHAIN_DELEGATION_MARKET_ACCOUNT = 'cedric.tests';

interface LeaseRequest {
  id: string;
  weeklyPay: number;
  weeklyPayCurrency: BaseCurrencies;
  duration: number;
  delegationValue: number;
}

const CreateDelegationRequestPage = ({
  activeAccount,
  currencyLabels,
  setTitleContainerProperties,
  navigateToWithParams,
  setErrorMessage,
  setSuccessMessage,
}: PropsFromRedux) => {
  const [leaseRequestForm, setLeaseRequestForm] = useState<LeaseRequest>({
    id: uuidv4(),
    delegationValue: 0,
    weeklyPay: 0,
    weeklyPayCurrency: BaseCurrencies.HIVE,
    duration: 0,
  });

  const options = [
    { label: currencyLabels.hive, value: 'hive' as keyof CurrencyLabels },
    { label: currencyLabels.hbd, value: 'hbd' as keyof CurrencyLabels },
  ];

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_delegation_market',
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
    const transferMemo = {
      key: LeaseKeys.REQUEST,
      ...leaseRequestForm,
    };
    const totalAmount =
      parseFloat(leaseRequestForm.weeklyPay.toString()) *
      parseInt(leaseRequestForm.duration.toString());
    const formattedTotalAmount = `${totalAmount.toFixed(3)} ${
      currencyLabels[leaseRequestForm.weeklyPayCurrency]
    }`;

    if (leaseRequestForm.weeklyPay < 1) {
      setErrorMessage('popup_html_delegation_market_payout_too_low');
      return;
    }
    if (leaseRequestForm.duration > 24) {
      setErrorMessage('popup_html_delegation_market_duration_too_long');
      return;
    }

    if (leaseRequestForm.weeklyPayCurrency === BaseCurrencies.HBD) {
      if (
        parseFloat(activeAccount.account.hbd_balance.toString().split(' ')[0]) <
        totalAmount
      ) {
        setErrorMessage('popup_html_delegation_market_unsuficient_funds');
        return;
      }
    }
    if (leaseRequestForm.weeklyPayCurrency === BaseCurrencies.HIVE) {
      if (
        parseFloat(activeAccount.account.balance.toString().split(' ')[0]) <
        totalAmount
      ) {
        setErrorMessage('popup_html_delegation_market_unsuficient_funds');
        return;
      }
    }
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_transfer_confirm_delegation_lease_request_message',
      ),
      fields: [
        {
          label: 'popup_html_delegation_market_requested_delegation',
          value: `${FormatUtils.formatCurrencyValue(
            leaseRequestForm.delegationValue,
          )} ${currencyLabels.hp}`,
        },
        {
          label: 'popup_html_delegation_market_payout',
          value: `${FormatUtils.formatCurrencyValue(
            leaseRequestForm.weeklyPay,
          )} ${currencyLabels[leaseRequestForm.weeklyPayCurrency]}`,
        },
        {
          label: 'popup_html_delegation_market_duration',
          value: `${leaseRequestForm.duration} ${chrome.i18n.getMessage(
            leaseRequestForm.duration > 1 ? 'weeks' : 'week',
          )}`,
        },
        {
          label: 'popup_html_delegation_market_total_cost',
          value: formattedTotalAmount,
        },
      ],
      title: 'popup_html_transfer_confirm_delegation_lease_request',
      formParams: leaseRequestForm,
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delegation_lease_request_operation');
        let success = false;

        success = await HiveUtils.transfer(
          activeAccount.name!,
          KEYCHAIN_DELEGATION_MARKET_ACCOUNT,
          formattedTotalAmount,
          JSON.stringify(transferMemo),
          false,
        );

        removeFromLoadingList('html_popup_delegation_lease_request_operation');

        if (success) {
          setSuccessMessage('html_popup_delegation_lease_request_success');
        } else {
          setErrorMessage('html_popup_delegation_lease_request_failed');
        }
      },
    });
  };

  return (
    <div className="create-delegation-request-page">
      <div className="introduction">
        {chrome.i18n.getMessage(
          'popup_html_delegation_market_request_introduction',
        )}
      </div>
      <div className="form">
        <InputComponent
          onChange={(newValue) => updateForm({ delegationValue: newValue })}
          value={leaseRequestForm.delegationValue}
          label="popup_html_delegation_market_requested_delegation"
          hint="popup_html_delegation_market_delegation_value_hint"
          placeholder="0.000"
          skipPlaceholderTranslation
          type={InputType.NUMBER}
        />
        <InputComponent
          type={InputType.NUMBER}
          placeholder="0.000"
          label="popup_html_delegation_market_payout"
          hint="popup_html_delegation_market_payout_hint"
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
          label="popup_html_delegation_market_duration"
          skipPlaceholderTranslation
          hint="popup_html_delegation_market_duration_hint"
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
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
  setErrorMessage,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const CreateDelegationRequestPageComponent = connector(
  CreateDelegationRequestPage,
);

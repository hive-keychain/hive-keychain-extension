import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { CurrencyListItem } from '@interfaces/list-item.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
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
import './create-delegation-request-page.component.scss';

const CreateDelegationRequestPage = ({
  activeAccount,
  currencyLabels,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [valueDelegation, setValueDelegation] = useState('');
  const [valuePayout, setValuePayout] = useState('');
  const [currencyPayout, setCurrencyPayout] = useState<keyof CurrencyLabels>(
    BaseCurrencies.HIVE,
  );
  const [valueDuration, setValueDuration] = useState('');

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

  const customLabelRender = (selectProps: SelectRenderer<CurrencyListItem>) => {
    return (
      <div
        className="selected-currency"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {currencyLabels[currencyPayout]}
      </div>
    );
  };
  const customItemRender = (
    selectProps: SelectItemRenderer<CurrencyListItem>,
  ) => {
    return (
      <div
        className={`select-account-item ${
          currencyPayout === selectProps.item.value ? 'selected' : ''
        }`}
        onClick={() => {
          setCurrencyPayout(selectProps.item.value);
          selectProps.methods.dropDown('close');
        }}>
        <div className="currency">{selectProps.item.label}</div>
      </div>
    );
  };

  const submit = async () => {
    console.log({
      valueDelegation,
      valuePayout,
      currencyPayout,
      valueDuration,
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
          onChange={setValueDelegation}
          value={valueDelegation}
          label="popup_html_delegation_market_requested_delegation"
          hint="popup_html_delegation_market_delegation_value_hint"
          placeholder="0.000"
          skipPlaceholderTranslation
          type={InputType.NUMBER}
          required
        />
        <div className="value-input-panel">
          <InputComponent
            type={InputType.NUMBER}
            placeholder="0.000"
            label="popup_html_delegation_market_payout"
            hint="popup_html_delegation_market_payout_hint"
            skipPlaceholderTranslation
            value={valuePayout}
            min={0}
            onChange={setValuePayout}
            required
          />
          <Select
            values={[]}
            options={options}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            itemRenderer={customItemRender}
            className="select-dropdown"
          />
        </div>
        <InputComponent
          type={InputType.NUMBER}
          placeholder="0"
          label="popup_html_delegation_market_nb_days"
          skipPlaceholderTranslation
          hint="popup_html_delegation_market_nb_days_hint"
          onChange={setValueDuration}
          value={valueDuration}
          required
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const CreateDelegationRequestPageComponent = connector(
  CreateDelegationRequestPage,
);

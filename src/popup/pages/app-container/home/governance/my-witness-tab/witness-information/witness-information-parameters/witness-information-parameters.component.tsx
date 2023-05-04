import { RootState } from '@popup/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import FormatUtils from 'src/utils/format.utils';
import { WITNESS_DISABLED_KEY } from 'src/utils/witness.utils';
import './witness-information-parameters.component.scss';

interface WitnessParametersInformationProps {
  witnessInfo: any;
}

const WitnessInformationParameters = ({
  witnessInfo,
}: PropsFromRedux & WitnessParametersInformationProps) => {
  const isWitnessDisabled = witnessInfo.signing_key === WITNESS_DISABLED_KEY;

  return (
    <div className="witness-information-parameters">
      {isWitnessDisabled && (
        <div className="disabled-text">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_witness_disabled_text',
          )}
        </div>
      )}
      <div className="label-title">
        {chrome.i18n.getMessage(
          'popup_html_witness_information_signing_key_label',
        )}
      </div>
      <div className="smaller-text">{witnessInfo.signing_key}</div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_maximum_block_size_label',
          )}
        </div>
        <div>{witnessInfo.maximum_block_size}</div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_account_creation_fee_label',
          )}
        </div>
        <div>
          {FormatUtils.withCommas(witnessInfo.account_creation_fee.toString())}{' '}
          {witnessInfo.account_creation_fee_symbol}
        </div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_hbd_interest_rate_label',
          )}
        </div>
        <div>
          {FormatUtils.withCommas(
            (parseFloat(witnessInfo.hbd_interest_rate) / 100).toString(),
          )}
          %
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyPrices: state.currencyPrices,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessInformationParametersComponent = connector(
  WitnessInformationParameters,
);

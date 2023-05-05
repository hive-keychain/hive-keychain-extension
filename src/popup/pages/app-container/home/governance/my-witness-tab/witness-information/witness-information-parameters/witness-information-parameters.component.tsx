import { WitnessInfo } from '@interfaces/witness.interface';
import { RootState } from '@popup/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import './witness-information-parameters.component.scss';

interface WitnessParametersInformationProps {
  witnessInfo: WitnessInfo;
}

const WitnessInformationParameters = ({
  witnessInfo,
}: PropsFromRedux & WitnessParametersInformationProps) => {
  return (
    <div className="witness-information-parameters">
      {witnessInfo.isDisabled && (
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
      <div className="smaller-text">{witnessInfo.signingKey}</div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_maximum_block_size_label',
          )}
        </div>
        <div>{witnessInfo.params.maximumBlockSize}</div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_account_creation_fee_label',
          )}
        </div>
        <div>{witnessInfo.params.accountCreationFeeFormatted}</div>
      </div>
      <div className="row-container">
        <div className="label-title">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_hbd_interest_rate_label',
          )}
        </div>
        <div>{witnessInfo.params.hbdInterestRate.toFixed(2)}%</div>
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

import { WitnessInfo } from '@interfaces/witness.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { WitnessInfoDataComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/witness-information/witness-info-data/witness-info-data.component';

interface WitnessParametersInformationProps {
  witnessInfo: WitnessInfo;
}

const WitnessInformationParameters = ({
  witnessInfo,
}: PropsFromRedux & WitnessParametersInformationProps) => {
  return (
    <div className="witness-information-parameters">
      <div className="label-title">
        {chrome.i18n.getMessage(
          'popup_html_witness_information_signing_key_label',
        )}
      </div>
      <div className="smaller-text">{witnessInfo.signingKey}</div>
      <div className="info-panel">
        <WitnessInfoDataComponent
          label={'popup_html_witness_information_maximum_block_size_label'}
          value={witnessInfo.params.maximumBlockSize}
        />
        <WitnessInfoDataComponent
          label={'popup_html_witness_information_account_creation_fee_label'}
          value={witnessInfo.params.accountCreationFeeFormatted}
        />
        <WitnessInfoDataComponent
          label={'popup_html_witness_information_hbd_interest_rate_label'}
          value={`${witnessInfo.params.hbdInterestRate.toFixed(2)}%`}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    currencyPrices: state.hive.currencyPrices,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessInformationParametersComponent = connector(
  WitnessInformationParameters,
);

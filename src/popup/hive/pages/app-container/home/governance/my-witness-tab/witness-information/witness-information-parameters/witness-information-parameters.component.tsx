import { WitnessInfo } from '@interfaces/witness.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { WitnessInfoDataComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/witness-information/witness-info-data/witness-info-data.component';
import { copyTextWithToast } from 'src/common-ui/toast/copy-toast.utils';

const formatSigningKey = (signingKey: string) => {
  if (signingKey.length <= 16) {
    return signingKey;
  }
  return `${signingKey.slice(0, 7)}...${signingKey.slice(-5)}`;
};

interface WitnessParametersInformationProps {
  witnessInfo: WitnessInfo;
}

const WitnessInformationParameters = ({
  witnessInfo,
}: PropsFromRedux & WitnessParametersInformationProps) => {
  const copySigningKey = () => {
    void copyTextWithToast(witnessInfo.signingKey, 'popup_html_copied');
  };

  return (
    <div className="witness-information-parameters">
      <div className="info-panel">
        <CustomTooltip
          message={witnessInfo.signingKey}
          skipTranslation
          additionalClassName="signing-key-tooltip">
          <WitnessInfoDataComponent
            label={'popup_html_witness_information_signing_key_label'}
            value={formatSigningKey(witnessInfo.signingKey)}
            valueOnClickAction={copySigningKey}
          />
        </CustomTooltip>
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

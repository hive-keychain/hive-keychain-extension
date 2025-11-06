import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';

interface Props {
  estimation: GasFeeEstimationBase;
  icon: SVGIcons;
  additionalClass: 'low' | 'increased' | 'medium' | 'aggressive' | 'custom';
  onSelectGasFee: () => void;
  label: string;
}

export const GasFeePanelItem = ({
  estimation,
  label,
  additionalClass,
  icon,
  onSelectGasFee,
}: Props) => {
  return (
    <div
      className={`custom-fee-row ${additionalClass}`}
      onClick={() => onSelectGasFee()}>
      <SVGIcon icon={icon} />
      <div className="label type">{chrome.i18n.getMessage(label)}</div>
      <div className="label duration">
        {chrome.i18n.getMessage('popup_html_evm_gas_fee_estimate_duration', [
          estimation.estimatedMaxDuration.toString(),
        ])}
      </div>
      <div className="label gas-fee">
        {FormatUtils.formatCurrencyValue(estimation.maxFee.toFixed(), 8)}
      </div>
    </div>
  );
};

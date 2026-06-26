import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  estimation: GasFeeEstimationBase;
  icon: SVGIcons;
  additionalClass: 'low' | 'increased' | 'medium' | 'aggressive' | 'custom';
  onSelectGasFee: () => void;
  label: string;
  showDuration?: boolean;
}

export const GasFeePanelItem = ({
  estimation,
  label,
  additionalClass,
  icon,
  onSelectGasFee,
  showDuration = true,
}: Props) => {
  return (
    <div
      className={`custom-fee-row ${additionalClass}${
        showDuration ? '' : ' no-duration'
      }`}
      onClick={() => onSelectGasFee()}>
      <SVGIcon icon={icon} />
      <div className="label type">{I18nUtils.getMessage(label)}</div>
      {showDuration && (
        <div className="label duration">
          {I18nUtils.getMessage('popup_html_evm_gas_fee_estimate_duration', [
            estimation.estimatedMaxDuration.toString(),
          ])}
        </div>
      )}
      <div className="label gas-fee">
        {GasFeeUtils.hasDisplayableEstimatedFee(estimation)
          ? GasFeeUtils.formatGasFeeValue(
              estimation.estimatedFeeInEth,
              8,
              'compact',
            )
          : '-'}
      </div>
    </div>
  );
};

import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
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
      <div className="label type">{I18nUtils.getMessage(label)}</div>
      <div className="label duration">
        {I18nUtils.getMessage('popup_html_evm_gas_fee_estimate_duration', [
          estimation.estimatedMaxDuration.toString(),
        ])}
      </div>
      <div className="label gas-fee">
        {GasFeeUtils.hasDisplayableEstimatedFee(estimation)
          ? FormatUtils.formatCurrencyValue(
              estimation.estimatedFeeInEth.toFixed(),
              8,
            )
          : '-'}
      </div>
    </div>
  );
};

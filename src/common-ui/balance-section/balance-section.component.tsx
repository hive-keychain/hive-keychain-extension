import React from 'react';
import FormatUtils from 'src/utils/format.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  value: number | string;
  unit: string;
  label?: string;
  decimals?: number;
  skipLabelTranslation?: boolean;
  skipFormat?: boolean;
}

export const BalanceSectionComponent = ({
  value,
  unit,
  label,
  skipLabelTranslation,
  skipFormat,
  decimals = 3,
}: Props) => {
  return (
    <div className="balance-section">
      <div className="value">
        {skipFormat ? value : FormatUtils.formatCurrencyValue(value, decimals)}{' '}
        {unit}
      </div>
      {label && (
        <div className="label">
          {skipLabelTranslation ? label : I18nUtils.getMessage(label)}
        </div>
      )}
    </div>
  );
};

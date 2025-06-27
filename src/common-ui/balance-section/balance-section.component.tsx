import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';

interface Props {
  value: number | string;
  unit: string;
  label?: string;
  decimals?: number;
  skipLabelTranslation?: boolean;
}

export const BalanceSectionComponent = ({
  value,
  unit,
  label,
  skipLabelTranslation,
  decimals = 3,
}: Props) => {
  return (
    <div className="balance-section">
      <div className="value">
        {FormatUtils.formatCurrencyValue(value, decimals)} {unit}
      </div>
      {label && (
        <div className="label">
          {skipLabelTranslation ? label : chrome.i18n.getMessage(label)}
        </div>
      )}
    </div>
  );
};

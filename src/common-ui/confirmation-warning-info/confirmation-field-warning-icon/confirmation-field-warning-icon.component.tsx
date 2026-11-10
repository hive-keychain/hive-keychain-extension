import { EvmTransactionWarning } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import React from 'react';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  warnings: EvmTransactionWarning[];
  onClick: () => void;
}

export const ConfirmationFieldWarningIcon = ({
  warnings,
  onClick,
}: Props) => {
  const activeWarnings = warnings.filter((warning) => !warning.ignored);
  if (activeWarnings.length === 0) {
    return null;
  }

  const highestWarning =
    EvmTransactionParserUtils.getHighestWarning(activeWarnings);

  return (
    <SVGIcon
      className={`confirmation-field-warning-icon warning-icon ${highestWarning.level}`}
      icon={
        highestWarning.ignored
          ? SVGIcons.GLOBAL_CHECK
          : EvmRiskWarningUtils.getWarningIcon(highestWarning.level)
      }
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    />
  );
};

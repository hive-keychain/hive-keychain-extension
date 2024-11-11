import { TransactionConfirmationField } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React from 'react';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';

export const EvmRequestItemAddress = ({
  name,
  value,
}: TransactionConfirmationField) => {
  const fieldTitle = useFieldTitle(name);

  return (
    <div className="field">
      <div className="label">{fieldTitle}</div>
      <div className="value">{EvmFormatUtils.formatAddress(value)}</div>
    </div>
  );
};

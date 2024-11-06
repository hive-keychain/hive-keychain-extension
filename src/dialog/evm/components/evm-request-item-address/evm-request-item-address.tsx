import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React from 'react';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';
import { TransactionConfirmationField } from 'src/dialog/evm/requests/send-transaction-2';

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

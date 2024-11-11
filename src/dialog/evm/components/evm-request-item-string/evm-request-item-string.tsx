import { TransactionConfirmationField } from '@popup/evm/interfaces/evm-transactions.interface';
import React from 'react';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';

export const EvmRequestItemString = ({
  name,
  value,
}: TransactionConfirmationField) => {
  const fieldTitle = useFieldTitle(name);

  return (
    <React.Fragment key={name}>
      <div className="field">
        <div className="label">{fieldTitle}</div>
        <div className="value">{value}</div>
      </div>
    </React.Fragment>
  );
};

import React from 'react';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';
import { TransactionConfirmationField } from 'src/dialog/evm/requests/send-transaction-2';

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

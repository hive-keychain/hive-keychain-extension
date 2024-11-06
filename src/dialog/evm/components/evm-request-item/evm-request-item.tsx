import React from 'react';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';
import { TransactionConfirmationField } from 'src/dialog/evm/requests/send-transaction-2';

export interface EvmRequestItemProps {
  field: TransactionConfirmationField;
}

export const EvmRequestItem = ({ field }: EvmRequestItemProps) => {
  const fieldTitle = useFieldTitle(field.name);

  //   switch (field.type) {
  //     case 'address':
  //       return <EvmRequestItemAddress {...field} />;
  //     case 'number':
  //     case 'uint256':
  //       return <EvmRequestItemNumber {...field} />;
  //     case 'string':
  //       return <EvmRequestItemString {...field} />;
  //     default:
  //       return <div>Type not defined</div>;
  //   }

  return (
    <div className="field">
      <div className="label">{fieldTitle}</div>
      <div className="value">{field.value}</div>
    </div>
  );
};

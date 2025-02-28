import React from 'react';
import { TransactionWarning } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { ConfirmationWarning } from 'src/common-ui/confirmation-warning-info/confirmation-warnings/confirmation-warning/confirmation-warning.component';

interface ConfirmationWarningsProps {
  warnings: TransactionWarning[];
  onWarningClicked: (index: number) => void;
}

export const ConfirmationWarnings = ({
  warnings,
  onWarningClicked,
}: ConfirmationWarningsProps) => {
  return (
    <div className="warning-container">
      {warnings.map((warning, index) => (
        <ConfirmationWarning
          warning={warning}
          key={`warning-${index}`}
          onWarningClicked={() => onWarningClicked(index)}
        />
      ))}
    </div>
  );
};

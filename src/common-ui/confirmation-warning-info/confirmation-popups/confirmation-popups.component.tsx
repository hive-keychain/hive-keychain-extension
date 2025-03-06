import React from 'react';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmMultipleWarningsPopup } from 'src/dialog/evm/requests/transaction-warnings/warning-multiple-popup.component';
import { EvmSinglePopupComponent } from 'src/dialog/evm/requests/transaction-warnings/warning-single-popup.component';

interface ConfirmationPopupProps {
  transactionHook: useTransactionHook;
}

export const ConfirmationPopup = ({
  transactionHook,
}: ConfirmationPopupProps) => {
  return (
    <>
      {transactionHook &&
        transactionHook.warningsPopupOpened &&
        transactionHook.hasWarning() && (
          <EvmMultipleWarningsPopup warningHook={transactionHook} />
        )}

      {transactionHook &&
        transactionHook.singleWarningPopupOpened &&
        transactionHook.selectedSingleWarning && (
          <EvmSinglePopupComponent warningHook={transactionHook} />
        )}
    </>
  );
};

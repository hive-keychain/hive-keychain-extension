import React from 'react';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmMultipleWarningsPopup } from 'src/dialog/evm/requests/transaction-warnings/warning-multiple-popup.component';

interface ConfirmationPopupProps {
  transactionHook: useTransactionHook;
}

export const ConfirmationPopup = ({
  transactionHook,
}: ConfirmationPopupProps) => {
  if (
    !transactionHook?.warningsPopupOpened ||
    !transactionHook.hasWarning()
  ) {
    return null;
  }

  return <EvmMultipleWarningsPopup warningHook={transactionHook} />;
};

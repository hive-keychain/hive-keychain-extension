import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { EvmRequestItem } from 'src/dialog/evm/components/evm-request-item/evm-request-item';
import { useTransactionWarningType } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.hook';

interface Props {
  warningHook: useTransactionWarningType;
  selectedAccount?: EvmAccount;
  chain?: EvmChain;
  tokenInfo?: EvmTokenInfoShort;
}
export const EvmTransactionWarningsComponent = ({
  warningHook,
  selectedAccount,
  chain,
  tokenInfo,
}: Props) => {
  return (
    <>
      {warningHook.fields?.operationName && (
        <div className="transaction-operation-name">
          {chrome.i18n.getMessage(
            `evm_operation_${warningHook.fields.operationName}`,
          )}
        </div>
      )}

      {selectedAccount && chain && (
        <div className="account-chain-panel">
          <EvmAccountDisplayComponent account={selectedAccount} />

          <div className="chain-info">
            <div className="chain-name">{chain.name}</div>
            <img className="chain-logo" src={chain.logo} />
          </div>
        </div>
      )}

      {warningHook.fields?.mainTokenAmount !== undefined &&
        warningHook.fields?.mainTokenAmount !== null &&
        tokenInfo && (
          <RequestItem
            title="popup_html_transfer_amount"
            content={warningHook.fields.mainTokenAmount.value}
          />
        )}

      {warningHook.fields &&
        warningHook.fields.otherFields?.map((f, index) => (
          <EvmRequestItem
            key={`${f.name}-${index}`}
            field={f}
            onWarningClicked={(warningIndex: number) =>
              warningHook.openSingleWarningPopup(
                index,
                warningIndex,
                f.warnings![warningIndex],
              )
            }
          />
        ))}
    </>
  );
};

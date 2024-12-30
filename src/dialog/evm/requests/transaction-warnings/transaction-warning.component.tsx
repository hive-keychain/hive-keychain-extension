import { EvmTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React from 'react';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { EvmRequestItem } from 'src/dialog/evm/components/evm-request-item/evm-request-item';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

interface Props {
  warningHook: useTransactionHook;
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
          {warningHook.fields.operationName}
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
        warningHook.fields?.mainTokenAmount !== null && (
          <EvmRequestItem field={warningHook.fields.mainTokenAmount} />
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

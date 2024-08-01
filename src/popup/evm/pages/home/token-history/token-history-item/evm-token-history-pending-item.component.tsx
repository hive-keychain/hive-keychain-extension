import { PendingTransactionData } from '@popup/evm/interfaces/evm-tokens.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { TransactionResponse } from 'ethers';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface EvmTokenHistoryPendingItemProps {
  pendingTransactionData: PendingTransactionData;
  chain: EvmChain;
  goToDetailsPage: (transactionResponse: TransactionResponse) => void;
  triggerRefreshHistory: () => void;
}

export const EvmTokenHistoryPendingItemComponent = ({
  pendingTransactionData,
  chain,
  goToDetailsPage,
  triggerRefreshHistory,
}: EvmTokenHistoryPendingItemProps) => {
  const [transactionResponse, setTransactionResponse] =
    useState<TransactionResponse>();

  useEffect(() => {
    check();
  }, []);

  const check = async () => {
    const txResponse = new TransactionResponse(
      pendingTransactionData.transaction,
      EthersUtils.getProvider(chain),
    );
    setTransactionResponse(txResponse);
    const transactionReceipt = await txResponse.wait();
    console.log(transactionReceipt);
    if (transactionReceipt) {
      await EvmTransactionsUtils.deleteFromPendingTransactions(
        transactionReceipt?.from,
        pendingTransactionData.transaction.nonce,
      );
      triggerRefreshHistory();
    }
  };

  return (
    <div className="wallet-history-item">
      {transactionResponse && (
        <div className="wallet-transaction-info">
          <div
            data-testid="transaction-expandable-area"
            className={`transaction`}
            key={`pending-${pendingTransactionData.transaction.hash}`}
            onClick={() => goToDetailsPage(transactionResponse)}>
            <div className="information-panel">
              <SVGIcon
                className="operation-icon"
                icon={SVGIcons.EVM_TRANSACTION_STATUS_PROCESSING}
                onClick={() => goToDetailsPage(transactionResponse)}
              />
              <div className="right-panel">
                <div className="detail">
                  {pendingTransactionData.amount}{' '}
                  {pendingTransactionData.tokenInfo.symbol}
                </div>
                <CustomTooltip
                  dataTestId="scustom-tool-tip"
                  additionalClassName="history-tooltip"
                  message={moment(Date.now()).format('YYYY/MM/DD , hh:mm:ss a')}
                  skipTranslation
                  color="grey">
                  <div className="date">{moment(Date.now()).format('L')}</div>
                </CustomTooltip>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

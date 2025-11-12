import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import Decimal from 'decimal.js';

export const sendEvmTransaction = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  extraData: any,
) => {
  const account = requestHandler.accounts.find((account: EvmAccount) => {
    return (
      account.wallet.address.toLowerCase() ===
      request.params[0].from.toLowerCase()
    );
  });
  if (account) {
    let res;
    extraData = {
      ...extraData,
      gasFee: {
        ...extraData.gasFee,
        gasLimit: new Decimal(extraData.gasFee.gasLimit),
        maxFee: new Decimal(extraData.gasFee.maxFee ?? 0),
        maxFeePerGas: new Decimal(extraData.gasFee.maxFeePerGas ?? 0),
        priorityFee: new Decimal(extraData.gasFee.priorityFee ?? 0),
      },
    };
    res = await EvmTransactionsUtils.send(
      account.wallet,
      request.params[0],
      extraData.gasFee,
      request.chainId!,
    );

    return await createEvmMessage(
      null,
      res,
      requestHandler.data,
      await chrome.i18n.getMessage('evm_send_transaction_success'),
    );
  }
};

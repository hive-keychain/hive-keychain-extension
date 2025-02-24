import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import {
  EvmRequest,
  getErrorFromEtherJS,
} from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';

export const sendEvmTransaction = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  extraData: any,
) => {
  try {
    const account = requestHandler.accounts.find((account: EvmAccount) => {
      return (
        account.wallet.address.toLowerCase() ===
        request.params[0].from.toLowerCase()
      );
    });
    if (account) {
      let res;
      res = await EvmTransactionsUtils.send(account, request, extraData.gasFee);
      return await createEvmMessage(
        null,
        res,
        requestHandler.data,
        await chrome.i18n.getMessage('evm_send_transaction_success'),
      );
    }
  } catch (err) {
    const error = err as any;
    return await createEvmMessage(
      err,
      null,
      requestHandler.data,
      null,
      getErrorFromEtherJS(error.code).message,
    );
  }
};

import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';

export const sendEvmTransaction = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  extraData: any,
) => {
  try {
    console.log({ requestHandler, request, extraData });

    const account = requestHandler.accounts.find((account: EvmAccount) => {
      return account.wallet.address.toLowerCase() === request.params[0].from;
    });
    if (account) {
      const res = await EvmTransactionsUtils.send(
        account,
        request,
        extraData.gasFee,
      );
      return await createEvmMessage(
        null,
        res,
        requestHandler.data,
        'evm_send_transaction_success',
      );
    }
  } catch (err) {
    console.log(err);
  }
};

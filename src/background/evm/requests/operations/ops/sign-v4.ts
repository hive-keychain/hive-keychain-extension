import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';

export const signV4 = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
) => {
  try {
    const account = requestHandler.accounts.find((account: EvmAccount) => {
      return (
        account.wallet.address.toLowerCase() === request.params[0].toLowerCase()
      );
    });
    if (account) {
      const res = await EvmRequestsUtils.signV4(
        account.wallet.privateKey,
        request.params[1],
      );
      return await createEvmMessage(
        null,
        res,
        requestHandler.data,
        'dialog_evm_sign_request_success',
      );
    }
  } catch (err) {
    console.log(err);
  }
};

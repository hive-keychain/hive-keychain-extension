import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import {
  EvmRequest,
  getErrorFromEtherJS,
} from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';

export const personalSign = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
) => {
  try {
    const account = requestHandler.accounts.find((account: EvmAccount) => {
      return (
        account.wallet.address.toLowerCase() === request.params[1].toLowerCase()
      );
    });
    if (account) {
      const res = await EvmRequestsUtils.signMessage(
        account.wallet.privateKey,
        request.params[0],
      );
      return await createEvmMessage(
        null,
        res,
        requestHandler.data,
        await chrome.i18n.getMessage('dialog_evm_sign_request_success'),
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

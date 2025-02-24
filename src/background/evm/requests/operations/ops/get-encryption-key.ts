import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import {
  EvmRequest,
  getErrorFromEtherJS,
} from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';

export const getEncryptionKey = async (
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
      const res = await EvmRequestsUtils.getEncryptionKey(account);
      return await createEvmMessage(
        null,
        res,
        requestHandler.data,
        await chrome.i18n.getMessage('dialog_evm_get_encryption_key_success'),
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

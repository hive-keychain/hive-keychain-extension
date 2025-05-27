import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import Logger from 'src/utils/logger.utils';

export const signData = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  version: SignTypedDataVersion,
) => {
  const TARGET_INDEX =
    request.method === EvmRequestMethod.ETH_SIGN_DATA ? 1 : 0;
  const account = requestHandler.accounts.find((account: EvmAccount) => {
    return (
      account.wallet.address.toLowerCase() ===
      request.params[TARGET_INDEX].toLowerCase()
    );
  });
  const message = EvmRequestMethod.ETH_SIGN_DATA
    ? JSON.stringify(request.params[0])
    : request.params[1];
  if (account) {
    try {
      const res = await EvmRequestsUtils.signData(
        account.wallet.privateKey,
        message,
        version,
      );
      return await createEvmMessage(
        null,
        res,
        requestHandler.data,
        await chrome.i18n.getMessage('dialog_evm_sign_request_success'),
      );
    } catch (e) {
      Logger.error('sign error', e);
    }
  }
};

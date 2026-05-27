import {
  EvmRequestHandler,
  EvmRequestLocator,
} from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';

const getUnsupportedLedgerDecryptError = () => {
  const error = new Error('Ledger does not support decrypt requests');
  (error as any).code = 'UNSUPPORTED_OPERATION';
  return error;
};

export const decryptMessage = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  locator: EvmRequestLocator,
) => {
  const requestData = requestHandler.getRequestDataByLocator(locator);
  const encryptedMessage = request.params?.[0];
  const accountAddress = request.params?.[1];
  if (
    typeof encryptedMessage !== 'string' ||
    typeof accountAddress !== 'string'
  ) {
    throw new Error('Invalid decrypt request');
  }

  const account = requestHandler.accounts.find((account: EvmAccount) => {
    return (
      account.wallet.address.toLowerCase() === accountAddress.toLowerCase()
    );
  });
  if (!account) {
    throw new Error('Account not found');
  }
  if (EvmSignerUtils.isLedgerWallet(account.wallet)) {
    throw getUnsupportedLedgerDecryptError();
  }

  const res = await EvmRequestsUtils.decryptMessage(account, encryptedMessage);
  return await createEvmMessage(
    null,
    res,
    request,
    requestData?.tab!,
    await chrome.i18n.getMessage('dialog_evm_decrypt_message_success'),
  );
};

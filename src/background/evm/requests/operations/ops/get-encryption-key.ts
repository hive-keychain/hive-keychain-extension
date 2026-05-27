import {
  EvmRequestHandler,
  EvmRequestLocator,
} from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import { ethers } from 'ethers';

const getUnsupportedLedgerEncryptionError = () => {
  const error = new Error('Ledger does not support encryption key requests');
  (error as any).code = 'UNSUPPORTED_OPERATION';
  return error;
};

export const getEncryptionKey = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  locator: EvmRequestLocator,
) => {
  const requestData = requestHandler.getRequestDataByLocator(locator);
  const accountAddress = request.params?.[0];
  if (typeof accountAddress !== 'string' || !ethers.isAddress(accountAddress)) {
    throw new Error('Invalid get encryption key request');
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
    throw getUnsupportedLedgerEncryptionError();
  }

  const res = await EvmRequestsUtils.getEncryptionKey(account);
  return await createEvmMessage(
    null,
    res,
    request,
    requestData?.tab!,
    await chrome.i18n.getMessage('dialog_evm_get_encryption_key_success'),
  );
};

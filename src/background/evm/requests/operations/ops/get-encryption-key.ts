import {
  EvmRequestHandler,
  EvmRequestLocator,
} from '@background/evm/requests/evm-request-handler';
import { createEvmMessage } from '@background/hive/requests/operations/operations.utils';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { ethers } from 'ethers';

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

  const res = await EvmRequestsUtils.getEncryptionKey(account);
  return await createEvmMessage(
    null,
    res,
    request,
    requestData?.tab!,
    await chrome.i18n.getMessage('dialog_evm_get_encryption_key_success'),
  );
};

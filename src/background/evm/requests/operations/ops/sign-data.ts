import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  EvmRequestHandler,
  EvmRequestLocator,
} from '@background/evm/requests/evm-request-handler';
import { createEvmMessage, feedbackI18n } from '@background/hive/requests/operations/operations.utils';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import Logger from 'src/utils/logger.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
export const signData = async (
  requestHandler: EvmRequestHandler,
  request: EvmRequest,
  locator: EvmRequestLocator,
  version: SignTypedDataVersion,
) => {
  const requestData = requestHandler.getRequestDataByLocator(locator);

  const TARGET_INDEX =
    request.method === EvmRequestMethod.ETH_SIGN_DATA ? 1 : 0;
  const account = requestHandler.accounts.find((account: EvmAccount) => {
    return (
      account.wallet.address.toLowerCase() ===
      request.params[TARGET_INDEX].toLowerCase()
    );
  });

  const message =
    request.method === EvmRequestMethod.ETH_SIGN_DATA
      ? JSON.stringify(request.params[0])
      : request.params[1];
  if (account) {
    try {
      const res = await EvmSignerUtils.signTypedMessage(
        account.wallet,
        message,
        version,
      );
      return await createEvmMessage(
        null,
        res,
        request,
        requestData?.tab!,
        feedbackI18n('dialog_evm_sign_request_success'),
      );
    } catch (e) {
      Logger.error('sign error', e);
      throw e;
    }
  }
};

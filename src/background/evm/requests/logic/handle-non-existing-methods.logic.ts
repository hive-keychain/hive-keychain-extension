import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EvmDappInfo,
  EvmRequest,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';

export const handleNonExistingMethod = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  dappInfo: EvmDappInfo,
) => {
  Logger.warn(
    `${
      request.method
    } doesn't exist, rawError: dialog_evm_non_existing_method, params: ${JSON.stringify(
      request.params,
    )}`,
  );

  const message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_ERROR,
    value: {
      requestId: request.request_id,
      error: ProviderRpcErrorList.nonExistingMethod,
    },
  };
  CommunicationUtils.tabsSendMessage(tab, message);
  await requestHandler.removeRequestById(request.request_id, tab);
};

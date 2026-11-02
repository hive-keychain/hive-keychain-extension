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
import { getPendingRequestMessageOptions } from '@background/multichain/pending-request.interface';

export const handleNonExistingMethod = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  dappInfo: EvmDappInfo,
) => {
  Logger.warn(`${request.method} doesn't exist`);

  const message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_ERROR,
    value: {
      requestId: request.request_id,
      error: ProviderRpcErrorList.nonExistingMethod,
    },
  };
  CommunicationUtils.tabsSendMessage(
    tab,
    message,
    getPendingRequestMessageOptions(dappInfo.requestSource),
  );
  await requestHandler.removeRequestByLocator({
    requestId: request.request_id,
    tab,
    origin: dappInfo.origin,
    frameId: dappInfo.requestSource?.frameId,
    documentId: dappInfo.requestSource?.documentId,
  });
};

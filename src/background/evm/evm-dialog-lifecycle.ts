import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import {
  ProviderRpcError,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

/* istanbul ignore next */
export const onRemoveEvm = async (winId: number) => {
  const requestHandler = await EvmRequestHandler.getFromLocalStorage();
  if (requestHandler) {
    for (const requestData of requestHandler.requestsData) {
      if (winId == requestHandler.windowId && requestData.tab) {
        CommunicationUtils.tabsSendMessage(requestData.tab!, {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: requestData!.request!.request_id,
            error: ProviderRpcErrorList.userReject as ProviderRpcError,
          },
        });
        requestHandler.removeRequestById(
          requestData!.request!.request_id,
          requestData.tab,
        );
      }
    }
    requestHandler.reset(true);
  }
};

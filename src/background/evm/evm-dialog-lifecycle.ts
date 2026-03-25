import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { isEvmDialogVisibleRequest } from '@background/multichain/dialog-request.utils';
import {
  ProviderRpcError,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

/* istanbul ignore next */
export const onRemoveEvm = async (winId: number) => {
  const requestHandler = await EvmRequestHandler.getFromLocalStorage();
  if (!requestHandler || winId !== requestHandler.windowId) {
    return;
  }

  for (const requestData of [...requestHandler.requestsData]) {
    if (
      requestData.tab &&
      requestData.request &&
      (await isEvmDialogVisibleRequest(requestData))
    ) {
      CommunicationUtils.tabsSendMessage(requestData.tab, {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: requestData.request.request_id,
          error: ProviderRpcErrorList.userReject as ProviderRpcError,
        },
      });
      await requestHandler.removeRequestById(
        requestData.request.request_id,
        requestData.tab,
        false,
      );
    }
  }
};

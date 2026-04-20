import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

export const requestAddCustomEvmChain = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  dappInfo: EvmDappInfo,
  requestedChainId: string,
) => {
  await requestHandler.setRequestDialog(request.request_id, tab, DialogCommand.REQUEST_ADD_CUSTOM_EVM_CHAIN, {
    requestedChainId,
  });

  /* istanbul ignore next */
  createOrUpdateDialog(async () => {
    CommunicationUtils.runtimeSendMessage({
      command: DialogCommand.REQUEST_ADD_CUSTOM_EVM_CHAIN,
      msg: {
        request,
        dappInfo,
        requestedChainId,
        initialChain: {
          chainId: requestedChainId,
        },
      },
      tab,
    });
  }, requestHandler);
};

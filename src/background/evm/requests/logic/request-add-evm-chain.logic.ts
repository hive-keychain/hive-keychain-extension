import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

export const requestAddEvmChain = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  dappInfo: EvmDappInfo,
) => {
  const requestedChain = await ChainUtils.getChainFromDefaultChains<EvmChain>(
    request.chainId!,
  );

  /* istanbul ignore next */
  createOrUpdateDialog(async () => {
    CommunicationUtils.runtimeSendMessage({
      command: DialogCommand.REQUEST_ADD_EVM_CHAIN,
      msg: {
        chain: requestedChain,
        request: request,
        dappInfo: dappInfo,
      },
      // @ts-ignore
      tab,
      dappInfo,
    });
  }, requestHandler);
};

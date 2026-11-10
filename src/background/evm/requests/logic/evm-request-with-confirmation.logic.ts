import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { syncSharedDialogWindow } from '@background/multichain/dialog-coordinator';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';

export const evmRequestWithConfirmation = async (
  requestHandler: EvmRequestHandler,
  _tab: number,
  _request: EvmRequest,
  _dappInfo: EvmDappInfo,
) => {
  await syncSharedDialogWindow({ evmRequestHandler: requestHandler });
};

/* istanbul ignore next */

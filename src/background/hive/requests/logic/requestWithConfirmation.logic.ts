import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

export const requestWithConfirmation = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  current_rpc: Rpc,
) => {
  const callback = () => {
    CommunicationUtils.runtimeSendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      request,
      domain,
      tab,
      rpc: current_rpc,
      hiveEngineConfig: requestHandler.hiveEngineConfig,
    });
  };
  createOrUpdateDialog(callback, requestHandler);
};

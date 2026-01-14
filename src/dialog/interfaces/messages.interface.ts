import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { KeychainRequest } from 'hive-keychain-commons';

export type HiveRequestMessage = {
  command: DialogCommand.SEND_DIALOG_CONFIRM;
  request: KeychainRequest;
  rpc: Rpc;
  tab: number;
  domain: string;
  accounts?: string[];
  hiveEngineConfig: HiveEngineConfig;
};

export type EvmRequestMessage = {
  command: DialogCommand.SEND_DIALOG_CONFIRM_EVM;
  request: EvmRequest;
  tab: number;
  dappInfo: EvmDappInfo;
  accounts?: EvmAccount[];
};

export type RequestAddEvmChainMessage = {
  command: DialogCommand.REQUEST_ADD_EVM_CHAIN;
  chainId: string;
  request: EvmRequest;
  tab: number;
  dappInfo: EvmDappInfo;
};

export type ErrorMessage = {
  msg: { display_msg: string; tab?: number };
  command: DialogCommand.SEND_DIALOG_ERROR;
};

export type ResultMessage = {
  msg: {
    message: string;
    success: boolean;
    data: KeychainRequest;
    tab?: number;
  };
  command: DialogCommand.ANSWER_REQUEST | DialogCommand.ANSWER_EVM_REQUEST;
};

export type FeedbackMessage = ResultMessage | ErrorMessage;

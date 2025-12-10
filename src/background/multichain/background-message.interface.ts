/* istanbul ignore file */
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import {
  DialogCommand,
  MultisigDialogCommand,
} from '@reference-data/dialog-message-key.enum';
import { VaultCommand } from '@reference-data/vault-message-key.enum';
import { KeychainRequestData } from 'hive-keychain-commons';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';

// export interface BackgroundMessage {
//   command: BackgroundCommand;
//   value?: any;
// }

export type BaseBackgroundMessage = {
  command: BackgroundCommand | VaultCommand;
  value?: any;
  key?: string;
};

export type SendRequestMessage = {
  command: BackgroundCommand.SEND_REQUEST;
  request: any;
  domain: string;
  request_id: number;
};

export type BackgroundMessage = BaseBackgroundMessage | SendRequestMessage;

// export interface DialogMessage {
//   command: DialogCommand;
//   msg?: any;
// }

export interface MultisigDialogMessage {
  command: MultisigDialogCommand;
  value?: any;
}

export type BaseDialogMessage = {
  command: DialogCommand;
  msg?: any;
};

export type AnswerDialogMessage = {
  command: DialogCommand.ANSWER_EVM_REQUEST;
  msg: any;
};

export type SendConfirmHiveMessage = {
  command: DialogCommand.SEND_DIALOG_CONFIRM;
  request: KeychainRequestData;
  domain: string;
  tab: number;
  accounts?: string[] | undefined;
  rpc?: Rpc;
  hiveEngineConfig?: HiveEngineConfig;
};

export type SendConfirmEvmMessage = {
  command: DialogCommand.SEND_DIALOG_CONFIRM_EVM;
  request: EvmRequest;
  dappInfo: EvmDappInfo;
  tab: number;
  accounts: EvmAccount[];
};

export type UnlockEvmDialogMessage = {
  command: DialogCommand.UNLOCK_EVM;
  msg: any;
  tab: number;
  dappInfo: EvmDappInfo;
};
export type UnlockDialogMessage = {
  command: DialogCommand.UNLOCK;
  msg: any;
  tab: number;
  dappInfo: string;
};

export type RegisterDialogMessage = {
  command: DialogCommand.REGISTER;
  msg: any;
  tab: number;
  domain: string;
};

export type SendDialogErrorMessage = {
  command: DialogCommand.SEND_DIALOG_ERROR;
  msg: any;
  tab: number;
};

export type ReturnLedgerSignatureMessage = {
  command: DialogCommand.LEDGER_RETURN_SIGNATURE;
  signature: string;
};

export type DialogReadyMessage = {
  command: DialogCommand.READY;
};

export type DialogMessage =
  | BaseDialogMessage
  | ReturnLedgerSignatureMessage
  | SendConfirmEvmMessage
  | SendConfirmHiveMessage
  | SendDialogErrorMessage
  | UnlockDialogMessage
  | UnlockEvmDialogMessage
  | RegisterDialogMessage
  | AnswerDialogMessage;

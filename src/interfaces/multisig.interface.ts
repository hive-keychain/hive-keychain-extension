import { ExtendedAccount } from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import { KeychainKeyTypes } from 'hive-keychain-commons';

export interface MultisigAccountKeyConfig {
  isEnabled: boolean;
  publicKey: string;
  message: string;
}

export interface MultisigAccountConfig {
  isEnabled: boolean;
  active: MultisigAccountKeyConfig;
  posting: MultisigAccountKeyConfig;
}

export interface MultisigConfig {
  [account: string]: MultisigAccountConfig;
}

export enum SocketMessageCommand {
  SIGNER_DISCONNECT = 'signer_disconnect',
  SIGNER_CONNECT = 'signer_connect',
  REQUEST_SIGNATURE = 'request_signature',
  REQUEST_SIGN_TRANSACTION = 'request_sign_transaction',
  SIGN_TRANSACTION = 'sign_transaction',
  REQUEST_LOCK = 'request_lock',
  NOTIFY_TRANSACTION_BROADCASTED = 'notify_transaction_broadcasted',
  TRANSACTION_BROADCASTED_NOTIFICATION = 'transaction_broadcasted_notification',
  TRANSACTION_ERROR_NOTIFICATION = 'transaction_error_notification',
}

export interface SocketMessage {
  command: string;
  payload: SocketMessagePayload;
}

export interface SocketMessagePayload {}

export interface NotifyTxBroadcastedMessage extends SocketMessagePayload {
  signatureRequestId: number;
}

export interface SignerConnectMessage extends SocketMessagePayload {
  publicKey: string;
  message: string;
  username: string;
}

export interface SignerConnectResponse {
  errors?: SignerConnectError;
  result?: SignerConnectResult;
}

export interface SignerConnectResult {
  pendingSignatureRequests?: UserPendingSignatureRequest;
  notifications?: UserNotifications;
}

export interface UserNotifications {
  [username: string]: UserNotification[];
}
export interface UserPendingSignatureRequest {
  [username: string]: SignatureRequest[];
}

export interface UserNotification {
  message: string;
  signatureRequest: SignatureRequest;
}
export interface SignerConnectError {
  [username: string]: string;
}

export interface ISignatureRequest {
  expirationDate: Date;
  threshold: number;
  keyType: KeychainKeyTypes;
  signers: RequestSignatureSigner[];
}

export interface SignatureRequestInitialSigner {
  username: string;
  publicKey: string;
  signature: string;
  weight: number;
}

export interface RequestSignatureMessage extends SocketMessagePayload {
  signatureRequest: ISignatureRequest;
  initialSigner: SignatureRequestInitialSigner;
}

export interface RequestSignatureSigner {
  encryptedTransaction: string; // Encrypted transaction with signer key
  publicKey: string;
  weight: string;
  metaData?: any;
}

export interface SignTransactionMessage extends SocketMessagePayload {
  signature: string;
  signerId: number;
  signatureRequestId: number;
}

export interface RefuseTransactionMessage extends SocketMessagePayload {
  signerId: number;
}

export interface SignatureRequest {
  id: number;
  expirationDate: Date;
  threshold: number;
  keyType: KeychainKeyTypes;
  initiator: string;
  initiatorPublicKey: string;
  locked: boolean;
  broadcasted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  signers: Signer[];
  targetedPublicKey: string;
}

export interface Signer {
  id: number;
  publicKey: string;
  encryptedTransaction: string;
  weight: number;
  signature?: string;
  refused?: boolean;
  notified?: boolean;
  signatureRequest: SignatureRequest;
}

export interface MultisigData {
  data: MultisigDataType;
  multisigStep: MultisigStep;
}

export type MultisigDataType =
  | MultisigAcceptRejectTxData
  | MultisigDisplayMessageData;

export interface MultisigAcceptRejectTxData {
  username: string;
  decodedTransaction: any;
  signer: Signer;
  signatureRequest: SignatureRequest;
}

export interface MultisigDisplayMessageData {
  message: string;
  success?: boolean;
  signer?: Signer;
  txId?: string;
  transaction?: any;
}

export interface MultisigUnlockData {
  feedback?: string;
}

export interface MultisigRequestSignatures {
  transaction: any;
  key: Key;
  initiatorAccount: ExtendedAccount;
  transactionAccount: ExtendedAccount;
  signature: string;
  method: KeychainKeyTypes;
  options: TransactionOptions;
}

export enum MultisigStep {
  ACCEPT_REJECT_TRANSACTION = 'ACCEPT_REJECT_TRANSACTION',
  NOTIFY_TRANSACTION_BROADCASTED = 'NOTIFY_TRANSACTION_BROADCASTED',
  SIGN_TRANSACTION_FEEDBACK = 'SIGN_TRANSACTION_FEEDBACK',
  UNLOCK_WALLET = 'UNLOCK_WALLET',
  NOTIFY_ERROR = 'NOTIFY_ERROR',
}

export interface ConnectDisconnectMessage {
  account: string;
  connect: boolean;
  message?: string;
  publicKey?: string;
  keyType?: KeychainKeyTypes;
}

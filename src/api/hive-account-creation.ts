import { KeychainApi } from '@api/keychain';
import {
  CreateHiveAccountCreationQuoteRequest,
  HiveAccountCreationQuoteResponse,
  HiveAccountCreationStatusResponse,
  SubmitHiveAccountCreationPaymentTxRequest,
} from '@interfaces/hive-account-creation.interface';

export interface HiveAccountCreationApiError extends Error {
  status: number;
  response: unknown;
}

const isSuccessStatus = (status: number) => status >= 200 && status < 300;

const createHiveAccountCreationApiError = (
  status: number,
  response: unknown,
): HiveAccountCreationApiError => {
  const message =
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof response.error === 'string'
      ? response.error
      : 'Unable to get Hive account creation status.';
  const error = new Error(message) as HiveAccountCreationApiError;
  error.status = status;
  error.response = response;
  return error;
};

const buildQuoteRequestBody = ({
  username,
  authorities,
  paymentCurrency,
  paymentChainId,
  paymentTokenAddress,
  paymentTokenDecimals,
  payerEvmAddress,
}: CreateHiveAccountCreationQuoteRequest) => ({
  username,
  paymentCurrency,
  paymentChainId,
  paymentTokenAddress,
  paymentTokenDecimals,
  payerEvmAddress,
  ownerPublicKey: authorities.owner.key_auths[0][0],
  activePublicKey: authorities.active.key_auths[0][0],
  postingPublicKey: authorities.posting.key_auths[0][0],
  memoPublicKey: authorities.memo_key,
});

const normalizeQuoteResponse = (response: any): HiveAccountCreationQuoteResponse => {
  if (response.payment) {
    return response as HiveAccountCreationQuoteResponse;
  }

  return {
    requestId: response.requestId,
    username: response.username,
    status: response.status,
    expiresAt: response.expiresAt,
    fee: response.currency === 'HIVE' ? `${response.amount} HIVE` : undefined,
    payment: {
      account: response.address,
      amount: response.amount,
      asset: response.currency,
      memo: response.memo,
      chainId: response.chainId,
      tokenAddress: response.tokenAddress,
      priceUsd: response.priceUsd,
      payerEvmAddress: response.payerEvmAddress,
    },
  };
};

export const createHiveAccountCreationQuote = async (
  request: CreateHiveAccountCreationQuoteRequest,
): Promise<HiveAccountCreationQuoteResponse> => {
  const response = await KeychainApi.post(
    'hive/account-creation/quote',
    buildQuoteRequestBody(request),
  );
  return normalizeQuoteResponse(response);
};

export const getHiveAccountCreationStatus = async (
  requestId: string,
): Promise<HiveAccountCreationStatusResponse> => {
  const response = await KeychainApi.getWithResponse(
    `hive/account-creation/${encodeURIComponent(requestId)}`,
  );
  if (isSuccessStatus(response.status)) {
    return response.data as HiveAccountCreationStatusResponse;
  }

  throw createHiveAccountCreationApiError(response.status, response.data);
};

export const submitHiveAccountCreationPaymentTx = async (
  requestId: string,
  request: SubmitHiveAccountCreationPaymentTxRequest,
): Promise<HiveAccountCreationStatusResponse> => {
  return await KeychainApi.post(
    `hive/account-creation/${encodeURIComponent(requestId)}/payment-tx`,
    request,
  );
};

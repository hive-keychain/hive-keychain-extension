import { KeychainApi } from '@api/keychain';
import {
  CreateHiveAccountCreationQuoteRequest,
  HiveAccountCreationQuoteResponse,
  HiveAccountCreationStatusResponse,
} from '@interfaces/hive-account-creation.interface';

const buildQuoteRequestBody = ({
  username,
  authorities,
}: CreateHiveAccountCreationQuoteRequest): CreateHiveAccountCreationQuoteRequest => ({
  username,
  authorities: {
    owner: authorities.owner,
    active: authorities.active,
    posting: authorities.posting,
    memo_key: authorities.memo_key,
  },
});

export const createHiveAccountCreationQuote = async (
  request: CreateHiveAccountCreationQuoteRequest,
): Promise<HiveAccountCreationQuoteResponse> => {
  return await KeychainApi.post(
    'hive/account-creation/quote',
    buildQuoteRequestBody(request),
  );
};

export const getHiveAccountCreationStatus = async (
  requestId: string,
): Promise<HiveAccountCreationStatusResponse> => {
  return await KeychainApi.get(
    `hive/account-creation/status/${encodeURIComponent(requestId)}`,
  );
};

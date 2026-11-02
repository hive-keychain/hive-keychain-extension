import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { anonymousRequests } from 'src/utils/requests.utils';

export const applyValidatedHiveDialogEdits = (
  persisted: KeychainRequest,
  dialogData: KeychainRequest | undefined,
  accounts: LocalAccount[] | undefined,
  allowKeylessUsername = false,
): KeychainRequest => {
  const next = { ...persisted };
  if (!dialogData) return next;

  const persistedUsername = persisted.username?.trim() ?? '';
  const dialogUsername = dialogData.username?.trim() ?? '';
  const usernameIsLocalAccount = accounts?.some(
    (account) => account.name === dialogUsername,
  );
  if (
    !persistedUsername &&
    dialogUsername &&
    anonymousRequests.includes(persisted.type) &&
    (usernameIsLocalAccount || allowKeylessUsername)
  ) {
    next.username = dialogUsername;
  }
  return next;
};

export type ResolvedHiveRequest = {
  request: KeychainRequest;
  domain: string;
  tab: number;
};

export const resolveAcceptedHiveRequest = (
  requestHandler: HiveRequestsHandler,
  value: {
    data?: KeychainRequest;
    tab?: number;
  },
  allowKeylessUsername = false,
): ResolvedHiveRequest | undefined => {
  const requestId = value.data?.request_id;
  const { tab } = value;
  if (requestId == null || tab == null) return undefined;

  const matchingRequests = requestHandler.requestsData.filter(
    (requestData) =>
      requestData.request_id === requestId && requestData.tab === tab,
  );
  if (matchingRequests.length !== 1) return undefined;

  const [requestData] = matchingRequests;
  if (!requestData?.request || !requestData.domain) return undefined;

  return {
    domain: requestData.domain,
    tab,
    request: applyValidatedHiveDialogEdits(
      requestData.request,
      value.data,
      requestData.accounts ?? requestHandler.accounts,
      allowKeylessUsername && requestData.isKeyless === true,
    ),
  };
};

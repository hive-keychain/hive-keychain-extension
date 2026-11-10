import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
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
  source: PendingRequestSource;
};

export const resolveAcceptedHiveRequest = (
  requestHandler: HiveRequestsHandler,
  value: {
    data?: KeychainRequest;
    tab?: number;
    requestSource?: PendingRequestSource;
  },
  allowKeylessUsername = false,
): ResolvedHiveRequest | undefined => {
  const requestId = value.data?.request_id;
  const { tab, requestSource } = value;
  if (requestId == null || tab == null) return undefined;
  if (requestSource && requestSource.tab !== tab) return undefined;

  const matchingRequests = requestSource
    ? [
        requestHandler.getRequestDataByLocator({
          requestId,
          ...requestSource,
        }),
      ]
    : requestHandler.requestsData.filter(
        (requestData) =>
          requestData.request_id === requestId &&
          requestData.tab === tab &&
          (!requestData.source || requestData.source.frameId === 0),
      );
  if (matchingRequests.length !== 1) return undefined;

  const [requestData] = matchingRequests;
  if (!requestData?.request || !requestData.domain) return undefined;

  return {
    domain: requestData.domain,
    tab,
    source: requestData.source ?? {
      tab,
      frameId: 0,
      origin: requestData.domain,
    },
    request: applyValidatedHiveDialogEdits(
      requestData.request,
      value.data,
      requestData.accounts ?? requestHandler.accounts,
      allowKeylessUsername && requestData.isKeyless === true,
    ),
  };
};

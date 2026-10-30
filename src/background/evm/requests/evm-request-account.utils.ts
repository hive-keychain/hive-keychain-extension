import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';

const accountAuthorizationMethods = new Set<EvmRequestMethod>([
  EvmRequestMethod.ETH_SIGN_DATA_3,
  EvmRequestMethod.ETH_SIGN_DATA_4,
  EvmRequestMethod.PERSONAL_SIGN,
  EvmRequestMethod.GET_ENCRYPTION_KEY,
  EvmRequestMethod.ETH_DECRYPT,
  EvmRequestMethod.SEND_TRANSACTION,
]);

const requiresAccountAuthorization = (request: EvmRequest): boolean =>
  accountAuthorizationMethods.has(request.method);

const getRequestedAccountAddress = (
  request: EvmRequest,
): string | undefined => {
  let requestedAccount: unknown;

  switch (request.method) {
    case EvmRequestMethod.SEND_TRANSACTION:
      requestedAccount = (request.params?.[0] as { from?: unknown } | undefined)
        ?.from;
      break;
    case EvmRequestMethod.GET_ENCRYPTION_KEY:
      requestedAccount = request.params?.[0];
      break;
    case EvmRequestMethod.ETH_DECRYPT:
    case EvmRequestMethod.PERSONAL_SIGN:
      requestedAccount = request.params?.[1];
      break;
    case EvmRequestMethod.ETH_SIGN_DATA_3:
    case EvmRequestMethod.ETH_SIGN_DATA_4:
      requestedAccount = request.params?.[0];
      break;
  }

  return typeof requestedAccount === 'string' ? requestedAccount : undefined;
};

const isRequestedAccountAuthorizedForOrigin = async (
  request: EvmRequest,
  origin: string,
): Promise<boolean> => {
  const requestedAccount = getRequestedAccountAddress(request);
  if (!requestedAccount) {
    return false;
  }

  const connectedWallets = await EvmWalletUtils.getConnectedWallets(origin);
  const normalizedRequestedAccount = requestedAccount.toLowerCase();
  return connectedWallets.some(
    (connectedWallet) =>
      connectedWallet.toLowerCase() === normalizedRequestedAccount,
  );
};

export const EvmRequestAccountUtils = {
  requiresAccountAuthorization,
  isRequestedAccountAuthorizedForOrigin,
};

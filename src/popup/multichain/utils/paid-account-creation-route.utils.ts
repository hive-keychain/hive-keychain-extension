import { Screen } from '@interfaces/screen.interface';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';

const EVM_PAYMENT_HASH = '#account-creation/evm-payment';

interface PaidAccountCreationRoute {
  screen: Screen;
  params: {
    requestId: string;
  };
}

const getSearchParamsFromHash = (hash: string): URLSearchParams => {
  const searchIndex = hash.indexOf('?');
  if (searchIndex === -1) {
    return new URLSearchParams();
  }
  return new URLSearchParams(hash.slice(searchIndex + 1));
};

const getHashPath = (hash: string): string => {
  const searchIndex = hash.indexOf('?');
  return searchIndex === -1 ? hash : hash.slice(0, searchIndex);
};

const buildPaymentStatusHash = (requestId: string): string => {
  const params = new URLSearchParams({ requestId });
  return `${EVM_PAYMENT_HASH}?${params.toString()}`;
};

const parseHash = (hash: string): PaidAccountCreationRoute | undefined => {
  if (getHashPath(hash) !== EVM_PAYMENT_HASH) {
    return undefined;
  }

  const requestId = getSearchParamsFromHash(hash).get('requestId');
  if (!requestId) {
    return undefined;
  }

  return {
    screen: Screen.PENDING_ACCOUNT_CREATION_PAYMENT,
    params: {
      requestId,
    },
  };
};

const clearHash = () => {
  window.history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search,
  );
};

const openPaymentStatusInSidePanel = async (
  requestId: string,
): Promise<void> => {
  await DetachedExtensionTabUtils.openDetachedExtension(
    buildPaymentStatusHash(requestId),
  );
};

export const PaidAccountCreationRouteUtils = {
  buildPaymentStatusHash,
  clearHash,
  openPaymentStatusInSidePanel,
  parseHash,
};

import { KeyType } from '@interfaces/keys.interface';
import { Screen } from '@interfaces/screen.interface';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';

interface LedgerRoute {
  screen: Screen;
  params?: {
    keyType?: KeyType;
    username?: string;
  };
}

const ADD_HIVE_ACCOUNTS_HASH = '#ledger/add-hive-accounts';
const ADD_EVM_ACCOUNTS_HASH = '#ledger/add-evm-accounts';
const ADD_KEY_HASH = '#ledger/add-key';
const LINK_DEVICE_HASH = '#ledger/link-device';

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

const buildAddKeyHash = (keyType: KeyType, username: string): string => {
  const params = new URLSearchParams({
    keyType,
    username,
  });
  return `${ADD_KEY_HASH}?${params.toString()}`;
};

const parseHash = (hash: string): LedgerRoute | undefined => {
  const hashPath = getHashPath(hash);

  switch (hashPath) {
    case ADD_HIVE_ACCOUNTS_HASH:
      return { screen: Screen.ACCOUNT_PAGE_ADD_ACCOUNTS_FROM_LEDGER };
    case ADD_EVM_ACCOUNTS_HASH:
      return { screen: Screen.EVM_ADD_ACCOUNTS_FROM_LEDGER };
    case LINK_DEVICE_HASH:
      return { screen: Screen.SETTINGS_LINK_LEDGER_DEVICE };
    case ADD_KEY_HASH: {
      const params = getSearchParamsFromHash(hash);
      return {
        screen: Screen.SETTINGS_ADD_KEY_FROM_LEDGER,
        params: {
          keyType: params.get('keyType') as KeyType | undefined,
          username: params.get('username') ?? undefined,
        },
      };
    }
    default:
      return undefined;
  }
};

const clearHash = () => {
  window.history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search,
  );
};

const openInSidePanelFromToolbarPopup = async (
  hash: string,
): Promise<boolean> => {
  if (!ExtensionSurfaceUtils.isToolbarPopup()) {
    return false;
  }

  await DetachedExtensionTabUtils.openDetachedExtension(hash);
  return true;
};

export const LedgerRouteUtils = {
  ADD_HIVE_ACCOUNTS_HASH,
  ADD_EVM_ACCOUNTS_HASH,
  LINK_DEVICE_HASH,
  buildAddKeyHash,
  clearHash,
  openInSidePanelFromToolbarPopup,
  parseHash,
};

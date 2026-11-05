import { Screen } from '@interfaces/screen.interface';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import {
  EVM_CREATE_WALLET_HASH,
  EvmWalletSetupTabUtils,
} from '@popup/evm/utils/evm-wallet-setup-tab.utils';

jest.mock('@popup/multichain/utils/extension-surface.utils', () => ({
  ExtensionSurfaceUtils: {
    isToolbarPopup: jest.fn(),
    isDetachedTab: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/detached-extension-tab.utils', () => ({
  DetachedExtensionTabUtils: {
    openDetachedExtension: jest.fn(),
    openDetachedExtensionTab: jest.fn(),
  },
}));

describe('EvmWalletSetupTabUtils', () => {
  const isToolbarPopupMock =
    ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
      typeof ExtensionSurfaceUtils.isToolbarPopup
    >;
  const isDetachedTabMock =
    ExtensionSurfaceUtils.isDetachedTab as jest.MockedFunction<
      typeof ExtensionSurfaceUtils.isDetachedTab
    >;
  const openDetachedExtensionMock =
    DetachedExtensionTabUtils.openDetachedExtension as jest.MockedFunction<
      typeof DetachedExtensionTabUtils.openDetachedExtension
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseEvmWalletSetupHash', () => {
    it('returns create for the create-wallet hash', () => {
      expect(
        EvmWalletSetupTabUtils.parseEvmWalletSetupHash(EVM_CREATE_WALLET_HASH),
      ).toBe('create');
    });

    it('returns null for unknown hashes', () => {
      expect(EvmWalletSetupTabUtils.parseEvmWalletSetupHash('#evm/import')).toBe(
        null,
      );
    });
  });

  describe('resolveEvmAppNavigationOnReady', () => {
    it('prioritizes create-wallet deep link over default routes', () => {
      expect(
        EvmWalletSetupTabUtils.resolveEvmAppNavigationOnReady(
          EVM_CREATE_WALLET_HASH,
        ),
      ).toBe('create_wallet');

      expect(
        EvmWalletSetupTabUtils.resolveEvmAppNavigationOnReady(
          EVM_CREATE_WALLET_HASH,
        ),
      ).toBe('create_wallet');
    });

    it('routes to home when there is no deep link', () => {
      expect(
        EvmWalletSetupTabUtils.resolveEvmAppNavigationOnReady(''),
      ).toBe('home_page');
    });
  });

  describe('buildCreateWalletNavigationStack', () => {
    it('keeps the current page under create-seed so back can return to it', () => {
      expect(
        EvmWalletSetupTabUtils.buildCreateWalletNavigationStack([
          { currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT },
          { currentPage: Screen.HOME_PAGE },
        ]),
      ).toEqual([
        {
          currentPage: Screen.CREATE_EVM_WALLET,
          params: { selectedAccountType: ChainType.EVM },
        },
        {
          currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT,
          params: { selectedAccountType: ChainType.EVM },
        },
        { currentPage: Screen.HOME_PAGE },
      ]);
    });

    it('uses add-account as the back target when the popup has no stack', () => {
      expect(EvmWalletSetupTabUtils.buildCreateWalletNavigationStack([])).toEqual(
        [
          {
            currentPage: Screen.CREATE_EVM_WALLET,
            params: { selectedAccountType: ChainType.EVM },
          },
          {
            currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT,
            params: { selectedAccountType: ChainType.EVM },
          },
        ],
      );
    });
  });

  describe('resolveCreateWalletNavigationOnStartup', () => {
    const sessionState: Record<string, unknown> = {};

    beforeEach(() => {
      Object.keys(sessionState).forEach((key) => {
        delete sessionState[key];
      });
      chrome.storage.session = {
        get: jest.fn(async (key: string) => ({ [key]: sessionState[key] })),
        set: jest.fn(async (items: Record<string, unknown>) => {
          Object.assign(sessionState, items);
        }),
        remove: jest.fn(async (key: string) => {
          delete sessionState[key];
        }),
      } as unknown as typeof chrome.storage.session;
    });

    afterEach(() => {
      delete (chrome.storage as { session?: unknown }).session;
    });

    it('restores the handed-off stack once', async () => {
      const stack = EvmWalletSetupTabUtils.buildCreateWalletNavigationStack([
        { currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT },
      ]);
      await EvmWalletSetupTabUtils.saveCreateWalletNavigationHandoff(stack);

      await expect(
        EvmWalletSetupTabUtils.resolveCreateWalletNavigationOnStartup(''),
      ).resolves.toEqual(stack);
      await expect(
        EvmWalletSetupTabUtils.resolveCreateWalletNavigationOnStartup(
          EVM_CREATE_WALLET_HASH,
        ),
      ).resolves.toEqual(
        EvmWalletSetupTabUtils.buildCreateWalletNavigationStack([]),
      );
    });

    it('falls back to create-seed with add-account underneath when only the hash is present', async () => {
      await expect(
        EvmWalletSetupTabUtils.resolveCreateWalletNavigationOnStartup(
          EVM_CREATE_WALLET_HASH,
        ),
      ).resolves.toEqual(
        EvmWalletSetupTabUtils.buildCreateWalletNavigationStack([]),
      );
    });

    it('returns null when there is no handoff and no create hash', async () => {
      await expect(
        EvmWalletSetupTabUtils.resolveCreateWalletNavigationOnStartup(''),
      ).resolves.toBeNull();
    });
  });

  describe('openEvmCreateWalletOutsideToolbarPopup', () => {
    it('opens the outside-popup create-wallet route', async () => {
      await EvmWalletSetupTabUtils.openEvmCreateWalletOutsideToolbarPopup([
        { currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT },
      ]);

      expect(openDetachedExtensionMock).toHaveBeenCalledWith(
        EVM_CREATE_WALLET_HASH,
      );
    });
  });

  describe('startEvmCreateWalletFromToolbarPopup', () => {
    it('opens outside the toolbar popup instead of navigating in place', async () => {
      isToolbarPopupMock.mockReturnValue(true);
      const navigateToCreateWallet = jest.fn();

      await EvmWalletSetupTabUtils.startEvmCreateWalletFromToolbarPopup(
        navigateToCreateWallet,
        [{ currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT }],
      );

      expect(openDetachedExtensionMock).toHaveBeenCalledWith(
        EVM_CREATE_WALLET_HASH,
      );
      expect(navigateToCreateWallet).not.toHaveBeenCalled();
    });

    it('navigates in place when not on the toolbar popup', async () => {
      isToolbarPopupMock.mockReturnValue(false);
      const navigateToCreateWallet = jest.fn();

      await EvmWalletSetupTabUtils.startEvmCreateWalletFromToolbarPopup(
        navigateToCreateWallet,
        [{ currentPage: Screen.ACCOUNT_PAGE_INIT_ACCOUNT }],
      );

      expect(openDetachedExtensionMock).not.toHaveBeenCalled();
      expect(navigateToCreateWallet).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUrlWithoutHash', () => {
    it('builds a URL from pathname and search only', () => {
      expect(
        EvmWalletSetupTabUtils.getUrlWithoutHash(
          '/detached_window.html',
          '?foo=bar',
        ),
      ).toBe('/detached_window.html?foo=bar');
    });
  });

  describe('shouldShowDetachedTabCreationSuccess', () => {
    it('returns true when opened in a detached tab', () => {
      isDetachedTabMock.mockReturnValue(true);

      expect(
        EvmWalletSetupTabUtils.shouldShowDetachedTabCreationSuccess(),
      ).toBe(true);
    });

    it('returns false when not opened in a detached tab', () => {
      isDetachedTabMock.mockReturnValue(false);

      expect(
        EvmWalletSetupTabUtils.shouldShowDetachedTabCreationSuccess(),
      ).toBe(false);
    });
  });

  describe('closeDetachedExtensionTab', () => {
    it('removes the current tab when chrome.tabs.getCurrent returns an id', () => {
      chrome.tabs.getCurrent = jest.fn((callback) => {
        callback({ id: 42 } as chrome.tabs.Tab);
      });
      chrome.tabs.remove = jest.fn();

      EvmWalletSetupTabUtils.closeDetachedExtensionTab();

      expect(chrome.tabs.remove).toHaveBeenCalledWith(42);
    });

    it('falls back to window.close when the current tab has no id', () => {
      chrome.tabs.getCurrent = jest.fn((callback) => {
        callback({} as chrome.tabs.Tab);
      });
      const closeSpy = jest
        .spyOn(window, 'close')
        .mockImplementation(() => undefined);

      EvmWalletSetupTabUtils.closeDetachedExtensionTab();

      expect(closeSpy).toHaveBeenCalledTimes(1);
      closeSpy.mockRestore();
    });
  });

  describe('clearEvmWalletSetupHash', () => {
    it('removes the hash from the current URL', () => {
      const replaceStateSpy = jest
        .spyOn(history, 'replaceState')
        .mockImplementation(() => undefined);

      EvmWalletSetupTabUtils.clearEvmWalletSetupHash(
        '/detached_window.html',
        '',
      );

      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        '',
        '/detached_window.html',
      );
    });
  });
});

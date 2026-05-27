import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
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
  const openDetachedExtensionTabMock =
    DetachedExtensionTabUtils.openDetachedExtensionTab as jest.MockedFunction<
      typeof DetachedExtensionTabUtils.openDetachedExtensionTab
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
          0,
        ),
      ).toBe('create_wallet');

      expect(
        EvmWalletSetupTabUtils.resolveEvmAppNavigationOnReady(
          EVM_CREATE_WALLET_HASH,
          3,
        ),
      ).toBe('create_wallet');
    });

    it('routes to add-wallet main when there are no accounts and no deep link', () => {
      expect(
        EvmWalletSetupTabUtils.resolveEvmAppNavigationOnReady('', 0),
      ).toBe('add_wallet_main');
    });

    it('routes to home when accounts exist and there is no deep link', () => {
      expect(
        EvmWalletSetupTabUtils.resolveEvmAppNavigationOnReady('', 2),
      ).toBe('home_page');
    });
  });

  describe('openEvmCreateWalletInTab', () => {
    it('opens detached_window.html with the create-wallet hash', () => {
      EvmWalletSetupTabUtils.openEvmCreateWalletInTab();

      expect(openDetachedExtensionTabMock).toHaveBeenCalledWith(
        EVM_CREATE_WALLET_HASH,
      );
    });
  });

  describe('startEvmCreateWalletFromToolbarPopup', () => {
    it('opens a tab from the toolbar popup instead of navigating in place', () => {
      isToolbarPopupMock.mockReturnValue(true);
      const navigateToCreateWallet = jest.fn();

      EvmWalletSetupTabUtils.startEvmCreateWalletFromToolbarPopup(
        navigateToCreateWallet,
      );

      expect(openDetachedExtensionTabMock).toHaveBeenCalledWith(
        EVM_CREATE_WALLET_HASH,
      );
      expect(navigateToCreateWallet).not.toHaveBeenCalled();
    });

    it('navigates in place when not on the toolbar popup', () => {
      isToolbarPopupMock.mockReturnValue(false);
      const navigateToCreateWallet = jest.fn();

      EvmWalletSetupTabUtils.startEvmCreateWalletFromToolbarPopup(
        navigateToCreateWallet,
      );

      expect(openDetachedExtensionTabMock).not.toHaveBeenCalled();
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

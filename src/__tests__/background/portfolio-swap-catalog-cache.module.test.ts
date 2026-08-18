import { PortfolioSwapCatalogCacheModule } from '@background/portfolio-swap-catalog-cache.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { PortfolioSwapCatalogCacheUtils } from 'src/portfolio/portfolio-swap-catalog-cache.utils';
import VaultUtils from 'src/utils/vault.utils';

jest.mock('src/portfolio/portfolio-swap-catalog-cache.utils', () => ({
  PortfolioSwapCatalogCacheUtils: {
    ensureSwapCatalogCached: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('src/utils/vault.utils', () => ({
  __esModule: true,
  default: {
    addWalletLockStateListener: jest.fn(),
    getValueFromVault: jest.fn(),
  },
}));

describe('PortfolioSwapCatalogCacheModule', () => {
  it('warms on startup and unlock without creating an hourly alarm', async () => {
    let walletLockStateListener: (() => void) | undefined;
    let runtimeMessageListener:
      | ((
          message: { command: BackgroundCommand },
          sender: chrome.runtime.MessageSender,
        ) => void)
      | undefined;
    (
      VaultUtils.addWalletLockStateListener as jest.Mock
    ).mockImplementation((listener) => {
      walletLockStateListener = listener;
    });
    jest
      .spyOn(chrome.runtime.onMessage, 'addListener')
      .mockImplementation((listener) => {
        runtimeMessageListener = listener as typeof runtimeMessageListener;
      });

    PortfolioSwapCatalogCacheModule.start();
    await Promise.resolve();

    expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached,
    ).toHaveBeenCalledTimes(1);
    expect(chrome.alarms.create).not.toHaveBeenCalled();

    (VaultUtils.getValueFromVault as jest.Mock).mockResolvedValueOnce(undefined);
    walletLockStateListener?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached,
    ).toHaveBeenCalledTimes(1);

    (VaultUtils.getValueFromVault as jest.Mock).mockResolvedValueOnce('mk');
    walletLockStateListener?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached,
    ).toHaveBeenCalledTimes(2);

    (VaultUtils.getValueFromVault as jest.Mock).mockResolvedValueOnce('mk');
    runtimeMessageListener?.(
      { command: BackgroundCommand.VAULT_LOADED },
      { id: chrome.runtime.id },
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached,
    ).toHaveBeenCalledTimes(3);
  });
});

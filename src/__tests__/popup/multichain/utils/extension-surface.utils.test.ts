import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';

describe('ExtensionSurfaceUtils', () => {
  it('detects the toolbar popup surface', () => {
    expect(ExtensionSurfaceUtils.isToolbarPopup('/popup.html')).toBe(true);
    expect(ExtensionSurfaceUtils.isDetachedTab('/popup.html')).toBe(false);
  });

  it('detects the detached tab surface', () => {
    expect(ExtensionSurfaceUtils.isDetachedTab('/detached_window.html')).toBe(
      true,
    );
    expect(ExtensionSurfaceUtils.isToolbarPopup('/detached_window.html')).toBe(
      false,
    );
  });

  it('detects the side panel surface', () => {
    expect(ExtensionSurfaceUtils.isSidePanelPage('/sidepanel.html')).toBe(true);
    expect(ExtensionSurfaceUtils.isToolbarPopup('/sidepanel.html')).toBe(false);
  });

  it('detects the portfolio page surface', () => {
    expect(ExtensionSurfaceUtils.isPortfolioPage('/portfolio.html')).toBe(true);
    expect(
      ExtensionSurfaceUtils.isPortfolioPage('/detached_window.html'),
    ).toBe(false);
  });
});

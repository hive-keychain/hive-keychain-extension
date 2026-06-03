import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { SidePanelLifecycleUtils } from '@popup/multichain/utils/side-panel-lifecycle.utils';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

jest.mock('@popup/multichain/utils/extension-surface.utils', () => ({
  ExtensionSurfaceUtils: {
    isSidePanelPage: jest.fn(),
  },
}));

jest.mock('src/utils/side-panel-preference.utils', () => ({
  SIDE_PANEL_RUNTIME_PORT: 'sidePanel',
  SidePanelPreferenceUtils: {
    markSidePanelActive: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('SidePanelLifecycleUtils', () => {
  const isSidePanelPageMock =
    ExtensionSurfaceUtils.isSidePanelPage as jest.MockedFunction<
      typeof ExtensionSurfaceUtils.isSidePanelPage
    >;
  const markSidePanelActiveMock =
    SidePanelPreferenceUtils.markSidePanelActive as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.markSidePanelActive
    >;
  const sendMessageMock = jest.fn();
  const connectMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    isSidePanelPageMock.mockReturnValue(false);
    chrome.runtime.sendMessage = sendMessageMock;
    chrome.runtime.connect = connectMock;
  });

  it('does nothing on non-sidepanel pages', () => {
    SidePanelLifecycleUtils.registerSidePanelPageLifecycle();

    expect(markSidePanelActiveMock).not.toHaveBeenCalled();
  });

  it('marks the side panel active and notifies the background when the page closes', () => {
    isSidePanelPageMock.mockReturnValue(true);

    SidePanelLifecycleUtils.registerSidePanelPageLifecycle();
    expect(markSidePanelActiveMock).toHaveBeenCalled();
    expect(connectMock).toHaveBeenCalledWith({ name: 'sidePanel' });

    window.dispatchEvent(new Event('pagehide'));
    expect(sendMessageMock).toHaveBeenCalledWith({
      command: BackgroundCommand.SIDE_PANEL_CLOSED,
    });
  });
});

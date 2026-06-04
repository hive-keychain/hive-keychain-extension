import { SidePanelToolbarLifecycle } from '@background/multichain/side-panel-toolbar.lifecycle';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

jest.mock('src/utils/side-panel-preference.utils', () => ({
  SIDE_PANEL_RUNTIME_PORT: 'sidePanel',
  SidePanelPreferenceUtils: {
    isSidePanelSessionActive: jest.fn(),
    markSidePanelInactive: jest.fn().mockResolvedValue(undefined),
    openSidePanelInCurrentWindow: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('SidePanelToolbarLifecycle', () => {
  const isSidePanelSessionActiveMock =
    SidePanelPreferenceUtils.isSidePanelSessionActive as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.isSidePanelSessionActive
    >;
  const markSidePanelInactiveMock =
    SidePanelPreferenceUtils.markSidePanelInactive as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.markSidePanelInactive
    >;
  const openSidePanelInCurrentWindowMock =
    SidePanelPreferenceUtils.openSidePanelInCurrentWindow as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.openSidePanelInCurrentWindow
    >;
  const openPopupMock = jest.fn().mockResolvedValue(undefined);
  let connectListener: ((port: chrome.runtime.Port) => void) | undefined;
  let onClosedListener: (() => void) | undefined;

  beforeAll(() => {
    chrome.runtime.onConnect.addListener = jest.fn((listener) => {
      connectListener = listener;
    }) as typeof chrome.runtime.onConnect.addListener;
    (chrome as any).sidePanel = {
      onClosed: {
        addListener: jest.fn((listener) => {
          onClosedListener = listener;
        }),
      },
    };
    SidePanelToolbarLifecycle.registerSidePanelToolbarLifecycle();
  });

  beforeEach(() => {
    isSidePanelSessionActiveMock.mockResolvedValue(false);
    (chrome as any).action = {
      openPopup: openPopupMock,
    };
    onClosedListener?.();
    jest.clearAllMocks();
  });

  const connectSidePanelPort = () => {
    const onDisconnect = jest.fn();
    connectListener?.({
      name: 'sidePanel',
      onDisconnect: {
        addListener: onDisconnect,
      },
    } as unknown as chrome.runtime.Port);
    return onDisconnect;
  };

  it('marks the side panel inactive when the runtime port disconnects', () => {
    const onDisconnect = connectSidePanelPort();

    onDisconnect.mock.calls[0][0]();

    expect(markSidePanelInactiveMock).toHaveBeenCalled();
  });

  it('marks the side panel inactive when chrome.sidePanel.onClosed fires', () => {
    onClosedListener?.();

    expect(markSidePanelInactiveMock).toHaveBeenCalled();
  });

  it('opens the side panel on toolbar click while a side panel port is connected', async () => {
    connectSidePanelPort();
    isSidePanelSessionActiveMock.mockResolvedValue(true);

    await SidePanelToolbarLifecycle.handleToolbarClickWhileSidePanelSessionActive();

    expect(openSidePanelInCurrentWindowMock).toHaveBeenCalled();
    expect(markSidePanelInactiveMock).not.toHaveBeenCalled();
    expect(openPopupMock).not.toHaveBeenCalled();
  });

  it('restores the popup when toolbar is clicked after the side panel closed', async () => {
    isSidePanelSessionActiveMock.mockResolvedValue(true);

    await SidePanelToolbarLifecycle.handleToolbarClickWhileSidePanelSessionActive();

    expect(markSidePanelInactiveMock).toHaveBeenCalled();
    expect(openPopupMock).toHaveBeenCalled();
    expect(openSidePanelInCurrentWindowMock).not.toHaveBeenCalled();
  });
});

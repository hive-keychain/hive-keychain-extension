import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn(),
  },
}));

describe('SidePanelPreferenceUtils', () => {
  const getValueFromLocalStorageMock =
    LocalStorageUtils.getValueFromLocalStorage as jest.MockedFunction<
      typeof LocalStorageUtils.getValueFromLocalStorage
    >;
  const saveValueInLocalStorageMock =
    LocalStorageUtils.saveValueInLocalStorage as jest.MockedFunction<
      typeof LocalStorageUtils.saveValueInLocalStorage
    >;
  const sessionGetMock = jest.fn();
  const sessionSetMock = jest.fn();
  const sessionRemoveMock = jest.fn();
  const setPopupMock = jest.fn().mockResolvedValue(undefined);
  let isSessionActive = false;

  beforeEach(() => {
    jest.clearAllMocks();
    isSessionActive = false;
    delete (chrome as any).sidePanel;
    getValueFromLocalStorageMock.mockResolvedValue(undefined);
    saveValueInLocalStorageMock.mockResolvedValue();
    sessionGetMock.mockResolvedValue({});
    sessionSetMock.mockImplementation(async (value) => {
      isSessionActive = value.SIDE_PANEL_SESSION_ACTIVE === true;
    });
    sessionGetMock.mockImplementation(async () => ({
      SIDE_PANEL_SESSION_ACTIVE: isSessionActive ? true : undefined,
    }));
    sessionRemoveMock.mockImplementation(async () => {
      isSessionActive = false;
    });
    (chrome as any).storage = {
      session: {
        get: sessionGetMock,
        set: sessionSetMock,
        remove: sessionRemoveMock,
      },
    };
    (chrome as any).action = {
      setPopup: setPopupMock,
    };
  });

  it('returns false when open side panel preference is unset', async () => {
    await expect(
      SidePanelPreferenceUtils.getOpenSidePanelByDefault(),
    ).resolves.toBe(false);
  });

  it('returns true when open side panel preference is enabled', async () => {
    getValueFromLocalStorageMock.mockResolvedValue(true);

    await expect(
      SidePanelPreferenceUtils.getOpenSidePanelByDefault(),
    ).resolves.toBe(true);
  });

  it('persists preference and syncs side panel startup settings', async () => {
    const setOptions = jest.fn().mockResolvedValue(undefined);
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setOptions, setPanelBehavior };
    saveValueInLocalStorageMock.mockImplementation(async (_key, value) => {
      getValueFromLocalStorageMock.mockResolvedValue(value);
    });
    getValueFromLocalStorageMock.mockResolvedValue(true);

    await SidePanelPreferenceUtils.setOpenSidePanelByDefault(true);

    expect(saveValueInLocalStorageMock).toHaveBeenCalledWith(
      LocalStorageKeyEnum.OPEN_SIDE_PANEL_BY_DEFAULT,
      true,
    );
    expect(setOptions).toHaveBeenCalledWith({
      path: 'sidepanel.html',
      enabled: true,
    });
    expect(setPopupMock).toHaveBeenCalledWith({ popup: 'popup.html' });
    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true,
    });
  });

  it('disables toolbar popup and opens the side panel on icon click while session is active', async () => {
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setPanelBehavior };
    isSessionActive = true;

    await SidePanelPreferenceUtils.syncToolbarActionBehavior();

    expect(setPopupMock).toHaveBeenCalledWith({ popup: '' });
    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true,
    });
  });

  it('marks the side panel session active and syncs toolbar behavior', async () => {
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setPanelBehavior };

    await SidePanelPreferenceUtils.markSidePanelActive();

    expect(sessionSetMock).toHaveBeenCalledWith({
      SIDE_PANEL_SESSION_ACTIVE: true,
    });
    expect(setPopupMock).toHaveBeenCalledWith({ popup: '' });
    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true,
    });
  });

  it('marks the side panel session inactive and restores toolbar behavior', async () => {
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setPanelBehavior };
    getValueFromLocalStorageMock.mockResolvedValue(true);

    await SidePanelPreferenceUtils.markSidePanelInactive();

    expect(sessionRemoveMock).toHaveBeenCalledWith('SIDE_PANEL_SESSION_ACTIVE');
    expect(setPopupMock).toHaveBeenCalledWith({ popup: 'popup.html' });
    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true,
    });
  });

  it('applies stored preference to side panel action click behavior', async () => {
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setPanelBehavior };
    getValueFromLocalStorageMock.mockResolvedValue(true);

    await SidePanelPreferenceUtils.applySidePanelActionClickBehavior();

    expect(setPopupMock).toHaveBeenCalledWith({ popup: 'popup.html' });
    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true,
    });
  });

  it('opens the side panel in the current window', async () => {
    const setOptions = jest.fn().mockResolvedValue(undefined);
    const open = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setOptions, open };
    chrome.windows.WINDOW_ID_CURRENT = -2;

    await SidePanelPreferenceUtils.openSidePanelInCurrentWindow();

    expect(setOptions).toHaveBeenCalledWith({
      path: 'sidepanel.html',
      enabled: true,
    });
    expect(open).toHaveBeenCalledWith({ windowId: -2 });
  });
});

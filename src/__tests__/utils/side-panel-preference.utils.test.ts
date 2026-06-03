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

  beforeEach(() => {
    jest.clearAllMocks();
    delete (chrome as any).sidePanel;
    getValueFromLocalStorageMock.mockResolvedValue(undefined);
    saveValueInLocalStorageMock.mockResolvedValue();
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
    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true,
    });
  });

  it('applies stored preference to side panel action click behavior', async () => {
    const setPanelBehavior = jest.fn().mockResolvedValue(undefined);
    (chrome as any).sidePanel = { setPanelBehavior };
    getValueFromLocalStorageMock.mockResolvedValue(true);

    await SidePanelPreferenceUtils.applySidePanelActionClickBehavior();

    expect(setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true,
    });
  });
});

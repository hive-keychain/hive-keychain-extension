import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HiveNotificationChannelPrefsUtils } from '@popup/hive/utils/notifications/hive-notification-channel-prefs.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('hive-notification-channel-prefs.utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('defaults missing operation prefs to browser enabled', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValueOnce(undefined);

    await expect(
      HiveNotificationChannelPrefsUtils.getOperationChannelPref(
        'Alice',
        'transfer',
      ),
    ).resolves.toEqual({ browser: true });
  });

  it('reads saved per-account operation prefs', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      alice: {
        transfer: { browser: false },
        vote: { drop: false, browser: true },
      },
    });

    await expect(
      HiveNotificationChannelPrefsUtils.isBrowserEnabledForOperation(
        'alice',
        'transfer',
      ),
    ).resolves.toBe(false);
    await expect(
      HiveNotificationChannelPrefsUtils.isBrowserEnabledForOperation(
        'alice',
        'vote',
      ),
    ).resolves.toBe(true);
  });

  it('saves operation channel prefs per account without clobbering others', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValueOnce({
      alice: {
        transfer: { browser: true },
      },
      bob: {
        vote: { browser: false },
      },
    });
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValueOnce(undefined as never);

    await HiveNotificationChannelPrefsUtils.setOperationChannelPref(
      'Alice',
      'transfer',
      { browser: false },
    );

    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.HIVE_NOTIFICATION_CHANNEL_PREFS,
      {
        alice: {
          transfer: { browser: false },
        },
        bob: {
          vote: { browser: false },
        },
      },
    );
  });
});

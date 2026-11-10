import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { EvmOnlyHivePromotionUtils } from 'src/utils/evm-only-hive-promotion.utils';

describe('evm-only-hive-promotion.utils tests:\n', () => {
  const mk = 'test-master-key';
  const now = new Date('2026-04-28T00:00:00.000Z');
  const eligibleInput = {
    installDate: '2026-04-20T00:00:00.000Z',
    evmAccountsCount: 1,
    hiveAccountsCount: 0,
    pendingHiveAccountCreationCount: 0,
    walletUnlocked: true,
    now,
  };
  const originalPromotionMinInstallAgeDays =
    process.env.HIVE_PROMOTION_MIN_INSTALL_AGE_DAYS;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    if (originalPromotionMinInstallAgeDays === undefined) {
      delete process.env.HIVE_PROMOTION_MIN_INSTALL_AGE_DAYS;
    } else {
      process.env.HIVE_PROMOTION_MIN_INSTALL_AGE_DAYS =
        originalPromotionMinInstallAgeDays;
    }
  });

  it('returns true when every EVM-only Hive promotion gate passes', () => {
    expect(
      EvmOnlyHivePromotionUtils.shouldShowEvmOnlyHivePromotion(eligibleInput),
    ).toBe(true);
  });

  it.each([
    ['new install', { installDate: '2026-04-22T00:00:00.000Z' }],
    ['no EVM accounts', { evmAccountsCount: 0 }],
    ['has a Hive account', { hiveAccountsCount: 1 }],
    [
      'has a pending Hive account creation request',
      { pendingHiveAccountCreationCount: 1 },
    ],
    ['permanently dismissed', { dismissedPermanently: true }],
    ['recently snoozed', { snoozedUntil: '2026-04-29T00:00:00.000Z' }],
    ['locked wallet', { walletUnlocked: false }],
    ['sensitive flow active', { sensitiveFlowActive: true }],
  ])('returns false when %s', (_caseName, override) => {
    expect(
      EvmOnlyHivePromotionUtils.shouldShowEvmOnlyHivePromotion({
        ...eligibleInput,
        ...override,
      }),
    ).toBe(false);
  });

  it('does not block eligibility for an expired snooze', () => {
    expect(
      EvmOnlyHivePromotionUtils.shouldShowEvmOnlyHivePromotion({
        ...eligibleInput,
        snoozedUntil: '2026-04-27T00:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('uses the configured promotion install age days when present', () => {
    process.env.HIVE_PROMOTION_MIN_INSTALL_AGE_DAYS = '3';

    expect(
      EvmOnlyHivePromotionUtils.shouldShowEvmOnlyHivePromotion({
        ...eligibleInput,
        installDate: '2026-04-25T00:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('falls back to 7 promotion install age days when env var is invalid', () => {
    process.env.HIVE_PROMOTION_MIN_INSTALL_AGE_DAYS = 'invalid';

    expect(
      EvmOnlyHivePromotionUtils.shouldShowEvmOnlyHivePromotion({
        ...eligibleInput,
        installDate: '2026-04-25T00:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('stores permanent dismissal without touching account storage', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({ snoozedUntil: '2026-04-29T00:00:00.000Z' });
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await EvmOnlyHivePromotionUtils.dismissEvmOnlyHivePromotionPermanently();

    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_ONLY_HIVE_PROMOTION,
      {
        dismissedPermanently: true,
        snoozedUntil: '2026-04-29T00:00:00.000Z',
      },
    );
    expect(saveSpy).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.ACCOUNTS,
      expect.anything(),
    );
  });

  it('stores snooze and last shown dates', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        snoozedUntil: '2026-05-01T00:00:00.000Z',
      });
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await EvmOnlyHivePromotionUtils.snoozeEvmOnlyHivePromotion(
      new Date('2026-05-01T00:00:00.000Z'),
    );
    await EvmOnlyHivePromotionUtils.setEvmOnlyHivePromotionLastShown(now);

    expect(saveSpy).toHaveBeenNthCalledWith(
      1,
      LocalStorageKeyEnum.EVM_ONLY_HIVE_PROMOTION,
      { snoozedUntil: '2026-05-01T00:00:00.000Z' },
    );
    expect(saveSpy).toHaveBeenNthCalledWith(
      2,
      LocalStorageKeyEnum.EVM_ONLY_HIVE_PROMOTION,
      {
        snoozedUntil: '2026-05-01T00:00:00.000Z',
        lastShownAt: '2026-04-28T00:00:00.000Z',
      },
    );
  });

  it('initializes install date when missing', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await expect(
      EvmOnlyHivePromotionUtils.getOrInitializeKeychainInstallDate(now),
    ).resolves.toBe('2026-04-28T00:00:00.000Z');

    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.KEYCHAIN_INSTALL_DATE,
      '2026-04-28T00:00:00.000Z',
    );
  });

  it('returns storage-backed eligibility without exposing pending accounts as normal accounts', async () => {
    const storage = new Map<LocalStorageKeyEnum, unknown>();
    storage.set(
      LocalStorageKeyEnum.KEYCHAIN_INSTALL_DATE,
      '2026-04-20T00:00:00.000Z',
    );
    storage.set(LocalStorageKeyEnum.EVM_ONLY_HIVE_PROMOTION, {});
    storage.set(
      LocalStorageKeyEnum.EVM_ACCOUNTS,
      await EncryptUtils.encryptJson(
        {
          list: [
            {
              id: 1,
              seed: 'seed',
              accounts: [{ id: 0, path: "44'/60'/0'/0/0" }],
            },
          ],
        },
        mk,
      ),
    );
    storage.set(
      LocalStorageKeyEnum.ACCOUNTS,
      await EncryptUtils.encryptJson({ list: [] }, mk),
    );
    storage.set(
      LocalStorageKeyEnum.PENDING_HIVE_ACCOUNT_CREATIONS,
      await EncryptUtils.encryptJson({ list: [] }, mk),
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation((key) => Promise.resolve(storage.get(key)));

    await expect(
      EvmOnlyHivePromotionUtils.getEvmOnlyHivePromotionEligibility({
        mk,
        walletUnlocked: true,
        now,
      }),
    ).resolves.toBe(true);
  });

  it('returns false from storage-backed eligibility when a pending request exists', async () => {
    const storage = new Map<LocalStorageKeyEnum, unknown>();
    storage.set(
      LocalStorageKeyEnum.KEYCHAIN_INSTALL_DATE,
      '2026-04-20T00:00:00.000Z',
    );
    storage.set(LocalStorageKeyEnum.EVM_ONLY_HIVE_PROMOTION, {});
    storage.set(
      LocalStorageKeyEnum.EVM_ACCOUNTS,
      await EncryptUtils.encryptJson(
        {
          list: [
            {
              id: 1,
              seed: 'seed',
              accounts: [{ id: 0, path: "44'/60'/0'/0/0" }],
            },
          ],
        },
        mk,
      ),
    );
    storage.set(
      LocalStorageKeyEnum.ACCOUNTS,
      await EncryptUtils.encryptJson({ list: [] }, mk),
    );
    storage.set(
      LocalStorageKeyEnum.PENDING_HIVE_ACCOUNT_CREATIONS,
      await EncryptUtils.encryptJson(
        {
          list: [
            {
              requestId: 'request-1',
              username: 'new-account',
              encryptedAccount: 'encrypted-pending-account-payload',
              paymentCurrency: 'HIVE',
              paymentAddress: 'hive-keychain',
              amount: '3.000',
              expiresAt: '2026-04-29T00:00:00.000Z',
              status: 'payment_pending',
              createdAt: '2026-04-28T00:00:00.000Z',
              updatedAt: '2026-04-28T00:00:00.000Z',
            },
          ],
        },
        mk,
      ),
    );
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation((key) => Promise.resolve(storage.get(key)));

    await expect(
      EvmOnlyHivePromotionUtils.getEvmOnlyHivePromotionEligibility({
        mk,
        walletUnlocked: true,
        now,
      }),
    ).resolves.toBe(false);
  });
});

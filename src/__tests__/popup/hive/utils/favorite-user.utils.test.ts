import BgdAccountsUtils from '@background/utils/accounts.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

jest.mock('hive-keychain-commons', () => {
  const actual = jest.requireActual('hive-keychain-commons');
  return {
    ...actual,
    ExchangesUtils: {
      getExchanges: () => [
        {
          username: 'blocked_exchange',
          name: 'X',
          acceptedCoins: ['HIVE'],
        },
        { username: '', name: 'NoName', acceptedCoins: ['HIVE'] },
      ],
    },
  };
});

describe('FavoriteUserUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAutocompleteList', () => {
    it('returns other local accounts and favorite users not matching exchange or local names', async () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue({
          alice: ['bob', 'blocked_exchange', 'carol'],
        });

      const list = await FavoriteUserUtils.getAutocompleteList('alice', [
        { name: 'alice', keys: {} },
        { name: 'bob', keys: {} },
        { name: 'dave', keys: {} },
      ] as any);

      const values = list.map((i) => i.value).sort();
      expect(values).toEqual(['bob', 'carol', 'dave']);
    });

    it('adds exchanges when addExchanges is true, optionally filtered by token', async () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(null);

      const all = await FavoriteUserUtils.getAutocompleteList(
        'alice',
        [{ name: 'alice', keys: {} }] as any,
        { addExchanges: true },
      );
      expect(all.some((e) => e.value === 'blocked_exchange')).toBe(true);

      const filtered = await FavoriteUserUtils.getAutocompleteList(
        'alice',
        [{ name: 'alice', keys: {} }] as any,
        { addExchanges: true, token: 'HBD' },
      );
      expect(filtered.some((e) => e.value === 'blocked_exchange')).toBe(false);
    });
  });

  describe('getAutocompleteListByCategories', () => {
    it('groups favorites, locals, and exchanges into categories', async () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue({
          alice: ['fav1'],
        });

      const out = await FavoriteUserUtils.getAutocompleteListByCategories(
        'alice',
        [
          { name: 'alice', keys: {} },
          { name: 'other', keys: {} },
        ] as any,
        { addExchanges: true, token: 'HIVE' },
      );

      expect(out.categories.length).toBeGreaterThanOrEqual(2);
      const titles = out.categories.map((c) => c.title);
      expect(titles.some((t) => String(t).length > 0)).toBe(true);
    });
  });

  describe('fixFavoriteList', () => {
    it('parses string storage, normalizes string entries, and persists when changed', async () => {
      const save = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      const raw = JSON.stringify({
        u1: ['plain', { value: 'x', subLabel: '' }],
      });

      const fixed = await FavoriteUserUtils.fixFavoriteList(raw);

      expect(fixed.u1[0]).toEqual({ label: 'plain', value: 'plain' });
      expect(save).toHaveBeenCalledWith(
        LocalStorageKeyEnum.FAVORITE_USERS,
        expect.objectContaining({
          u1: expect.arrayContaining([
            expect.objectContaining({ value: 'plain' }),
          ]),
        }),
      );
    });

    it('ensures each user key maps to an array', async () => {
      jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      const fixed = await FavoriteUserUtils.fixFavoriteList({
        u: 'not-array' as any,
      });

      expect(Array.isArray((fixed as any).u)).toBe(true);
    });
  });

  describe('saveFavoriteUser', () => {
    it('appends username when not already favorited and not exchange/local account', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue('mk');
      jest
        .spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValue([{ name: 'alice' }] as any);
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue({
          alice: [],
        });
      const save = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await FavoriteUserUtils.saveFavoriteUser('newpal', {
        name: 'alice',
        keys: {},
      } as any);

      expect(save).toHaveBeenCalledWith(LocalStorageKeyEnum.FAVORITE_USERS, {
        alice: [{ label: 'newpal', value: 'newpal', subLabel: '' }],
      });
      expect(VaultUtils.getValueFromVault).toHaveBeenCalledWith(VaultKey.__MK);
    });

    it('does not duplicate an existing favorite', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue('mk');
      jest
        .spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValue([]);
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue({
          alice: [{ value: 'dup', subLabel: '' }],
        });
      const save = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

      await FavoriteUserUtils.saveFavoriteUser('dup', {
        name: 'alice',
        keys: {},
      } as any);

      expect(save).toHaveBeenCalledWith(
        LocalStorageKeyEnum.FAVORITE_USERS,
        expect.objectContaining({
          alice: [{ value: 'dup', subLabel: '' }],
        }),
      );
    });
  });
});

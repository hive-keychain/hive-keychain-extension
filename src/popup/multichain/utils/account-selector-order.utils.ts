import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import AccountUtils from '@popup/hive/utils/account.utils';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import {
  AccountSelectorDisplayOrderPayload,
  AccountSelectorOrderRef,
} from '@interfaces/account-selector-order.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export type AccountSelectorListItem =
  | {
      account: LocalAccount;
      id: string;
      type: ChainType.HIVE;
    }
  | {
      account: EvmAccount;
      id: string;
      type: ChainType.EVM;
    };

const getOrderRefKey = (ref: AccountSelectorOrderRef) =>
  ref.type === 'hive'
    ? `hive:${ref.name}`
    : `evm:${ref.seedId}-${ref.accountId}`;

const isHiveOrderRef = (
  ref: AccountSelectorOrderRef,
): ref is Extract<AccountSelectorOrderRef, { type: 'hive' }> =>
  ref.type === 'hive';

const isEvmOrderRef = (
  ref: AccountSelectorOrderRef,
): ref is Extract<AccountSelectorOrderRef, { type: 'evm' }> =>
  ref.type === 'evm';

const getEvmOrderRefs = (refs: AccountSelectorOrderRef[]) =>
  refs.filter(isEvmOrderRef);

const areEvmOrderRefsEqual = (
  left: AccountSelectorOrderRef[],
  right: AccountSelectorOrderRef[],
) => {
  const leftEvmRefs = getEvmOrderRefs(left);
  const rightEvmRefs = getEvmOrderRefs(right);

  return (
    leftEvmRefs.length === rightEvmRefs.length &&
    leftEvmRefs.every(
      (ref, index) =>
        ref.seedId === rightEvmRefs[index].seedId &&
        ref.accountId === rightEvmRefs[index].accountId,
    )
  );
};

const isStoredDisplayOrderPayload = (
  value: unknown,
): value is AccountSelectorDisplayOrderPayload =>
  typeof value === 'object' &&
  value !== null &&
  Array.isArray((value as AccountSelectorDisplayOrderPayload).list);

const isStoredDisplayOrderRefArray = (
  value: unknown,
): value is AccountSelectorOrderRef[] => Array.isArray(value);

const normalizeDecryptedDisplayOrder = (
  decrypted: unknown,
): AccountSelectorOrderRef[] => {
  if (isStoredDisplayOrderPayload(decrypted)) {
    return decrypted.list;
  }
  if (isStoredDisplayOrderRefArray(decrypted)) {
    return decrypted;
  }
  return [];
};

const hiveRefFromAccount = (account: LocalAccount): AccountSelectorOrderRef => ({
  type: 'hive',
  name: account.name,
});

const evmRefFromAccount = (account: EvmAccount): AccountSelectorOrderRef => ({
  type: 'evm',
  seedId: account.seedId,
  accountId: account.id,
});

const buildAccountSelectorListItems = (
  hiveAccounts: LocalAccount[],
  evmAccounts: EvmAccount[],
): AccountSelectorListItem[] => [
  ...hiveAccounts.map((account) => ({
    account,
    id: `hive-${account.name}`,
    type: ChainType.HIVE as const,
  })),
  ...evmAccounts.map((account) => ({
    account,
    id: `evm-${account.wallet?.address ?? account.address ?? account.id}`,
    type: ChainType.EVM as const,
  })),
];

const buildDefaultDisplayOrder = (
  hiveAccounts: LocalAccount[],
  evmVisibleAccounts: EvmAccount[],
): AccountSelectorOrderRef[] => [
  ...hiveAccounts.map(hiveRefFromAccount),
  ...[...evmVisibleAccounts]
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
    .map(evmRefFromAccount),
];

const mergeDisplayOrder = (
  savedOrder: AccountSelectorOrderRef[],
  hiveAccounts: LocalAccount[],
  evmVisibleAccounts: EvmAccount[],
): AccountSelectorOrderRef[] => {
  const hiveByName = new Map(
    hiveAccounts.map((account) => [account.name, account] as const),
  );
  const evmByKey = new Map(
    evmVisibleAccounts.map(
      (account) =>
        [getOrderRefKey(evmRefFromAccount(account)), account] as const,
    ),
  );

  const merged: AccountSelectorOrderRef[] = [];
  const seen = new Set<string>();

  for (const ref of savedOrder) {
    const key = getOrderRefKey(ref);
    if (seen.has(key)) {
      continue;
    }

    if (isHiveOrderRef(ref) && hiveByName.has(ref.name)) {
      merged.push(ref);
      seen.add(key);
      continue;
    }

    if (isEvmOrderRef(ref) && evmByKey.has(key)) {
      merged.push(ref);
      seen.add(key);
    }
  }

  for (const account of hiveAccounts) {
    const ref = hiveRefFromAccount(account);
    const key = getOrderRefKey(ref);
    if (!seen.has(key)) {
      merged.push(ref);
      seen.add(key);
    }
  }

  for (const account of evmVisibleAccounts) {
    const ref = evmRefFromAccount(account);
    const key = getOrderRefKey(ref);
    if (!seen.has(key)) {
      merged.push(ref);
      seen.add(key);
    }
  }

  return merged;
};

const sortListItemsByDisplayOrder = (
  items: AccountSelectorListItem[],
  displayOrder: AccountSelectorOrderRef[],
): AccountSelectorListItem[] => {
  const itemByKey = new Map(
    items.map((item) => {
      const ref =
        item.type === ChainType.HIVE
          ? hiveRefFromAccount(item.account)
          : evmRefFromAccount(item.account);
      return [getOrderRefKey(ref), item] as const;
    }),
  );

  const sorted: AccountSelectorListItem[] = [];
  const seen = new Set<string>();

  for (const ref of displayOrder) {
    const key = getOrderRefKey(ref);
    const item = itemByKey.get(key);
    if (item && !seen.has(key)) {
      sorted.push(item);
      seen.add(key);
    }
  }

  for (const item of items) {
    const ref =
      item.type === ChainType.HIVE
        ? hiveRefFromAccount(item.account)
        : evmRefFromAccount(item.account);
    const key = getOrderRefKey(ref);
    if (!seen.has(key)) {
      sorted.push(item);
      seen.add(key);
    }
  }

  return sorted;
};

const buildOrderedListItems = (
  hiveAccounts: LocalAccount[],
  evmVisibleAccounts: EvmAccount[],
  displayOrder: AccountSelectorOrderRef[],
): AccountSelectorListItem[] => {
  const items = buildAccountSelectorListItems(hiveAccounts, evmVisibleAccounts);
  if (!displayOrder.length) {
    return items;
  }
  return sortListItemsByDisplayOrder(items, displayOrder);
};

const getDecryptedDisplayOrder = async (
  mk: string,
): Promise<AccountSelectorOrderRef[]> => {
  const stored = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACCOUNT_SELECTOR_DISPLAY_ORDER,
  );

  if (!stored) {
    return [];
  }

  if (isStoredDisplayOrderPayload(stored) || isStoredDisplayOrderRefArray(stored)) {
    const refs = normalizeDecryptedDisplayOrder(stored);
    await saveDisplayOrder(mk, refs);
    return refs;
  }

  const decrypted = await EncryptUtils.decryptToJson(stored, mk);
  const refs = normalizeDecryptedDisplayOrder(decrypted);
  return refs;
};

const saveDisplayOrder = async (
  mk: string,
  refs: AccountSelectorOrderRef[],
): Promise<void> => {
  const payload: AccountSelectorDisplayOrderPayload = { list: refs };
  const encrypted = await EncryptUtils.encryptJson(payload, mk);
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACCOUNT_SELECTOR_DISPLAY_ORDER,
    encrypted,
  );
};

const reorderHiveAccountsByRefs = (
  hiveAccounts: LocalAccount[],
  orderedRefs: AccountSelectorOrderRef[],
): LocalAccount[] => {
  const hiveByName = new Map(
    hiveAccounts.map((account) => [account.name, account] as const),
  );
  const reordered: LocalAccount[] = [];
  const seen = new Set<string>();

  for (const ref of orderedRefs) {
    if (!isHiveOrderRef(ref) || seen.has(ref.name)) {
      continue;
    }
    const account = hiveByName.get(ref.name);
    if (account) {
      reordered.push(account);
      seen.add(ref.name);
    }
  }

  for (const account of hiveAccounts) {
    if (!seen.has(account.name)) {
      reordered.push(account);
    }
  }

  return reordered;
};

const syncDisplayOrderWithAccounts = async (
  mk: string,
  hiveAccounts: LocalAccount[],
  evmVisibleAccounts: EvmAccount[],
): Promise<AccountSelectorOrderRef[]> => {
  const savedOrder = await getDecryptedDisplayOrder(mk);
  const merged =
    savedOrder.length > 0
      ? mergeDisplayOrder(savedOrder, hiveAccounts, evmVisibleAccounts)
      : buildDefaultDisplayOrder(hiveAccounts, evmVisibleAccounts);

  await saveDisplayOrder(mk, merged);
  return merged;
};

const applyDisplayOrder = async (
  mk: string,
  orderedRefs: AccountSelectorOrderRef[],
  hiveAccounts: LocalAccount[],
  evmVisibleAccounts: EvmAccount[],
): Promise<{
  displayOrder: AccountSelectorOrderRef[];
  hiveAccounts: LocalAccount[];
  evmAccounts: EvmAccount[];
}> => {
  await saveDisplayOrder(mk, orderedRefs);

  const reorderedHive = reorderHiveAccountsByRefs(hiveAccounts, orderedRefs);
  await AccountUtils.saveAccounts(reorderedHive, mk);

  const evmRefs = orderedRefs.filter(isEvmOrderRef);
  const evmByKey = new Map(
    evmVisibleAccounts.map(
      (account) =>
        [getOrderRefKey(evmRefFromAccount(account)), account] as const,
    ),
  );
  const orderedVisibleForEvm = evmRefs
    .map((ref) => evmByKey.get(getOrderRefKey(ref)))
    .filter((account): account is EvmAccount => !!account);

  const remainingVisible = evmVisibleAccounts.filter(
    (account) =>
      !orderedVisibleForEvm.some(
        (ordered) =>
          ordered.seedId === account.seedId && ordered.id === account.id,
      ),
  );
  const orderedVisibleAccounts = [
    ...orderedVisibleForEvm,
    ...remainingVisible,
  ];

  const evmAccounts = await EvmWalletUtils.reorderAccounts(
    orderedVisibleAccounts.map((account) => ({
      id: account.id,
      seedId: account.seedId,
    })),
    mk,
  );

  return {
    displayOrder: orderedRefs,
    hiveAccounts: reorderedHive,
    evmAccounts,
  };
};

const reencryptDisplayOrder = async (
  oldMk: string,
  newMk: string,
): Promise<void> => {
  const refs = await getDecryptedDisplayOrder(oldMk);
  if (!refs.length) {
    return;
  }
  await saveDisplayOrder(newMk, refs);
};

const toOrderRef = (item: AccountSelectorListItem): AccountSelectorOrderRef =>
  item.type === ChainType.HIVE
    ? hiveRefFromAccount(item.account)
    : evmRefFromAccount(item.account);

const toOrderRefs = (items: AccountSelectorListItem[]): AccountSelectorOrderRef[] =>
  items.map(toOrderRef);

const loadOrderedListItems = async (
  mk: string,
  hiveAccounts: LocalAccount[],
  evmVisibleAccounts: EvmAccount[],
): Promise<{
  displayOrder: AccountSelectorOrderRef[];
  listItems: AccountSelectorListItem[];
}> => {
  const savedOrder = await getDecryptedDisplayOrder(mk);
  const displayOrder =
    savedOrder.length > 0
      ? mergeDisplayOrder(savedOrder, hiveAccounts, evmVisibleAccounts)
      : buildDefaultDisplayOrder(hiveAccounts, evmVisibleAccounts);

  return {
    displayOrder,
    listItems: buildOrderedListItems(
      hiveAccounts,
      evmVisibleAccounts,
      displayOrder,
    ),
  };
};

const AccountSelectorOrderUtils = {
  buildAccountSelectorListItems,
  buildDefaultDisplayOrder,
  mergeDisplayOrder,
  sortListItemsByDisplayOrder,
  buildOrderedListItems,
  getDecryptedDisplayOrder,
  saveDisplayOrder,
  syncDisplayOrderWithAccounts,
  applyDisplayOrder,
  reencryptDisplayOrder,
  toOrderRef,
  toOrderRefs,
  loadOrderedListItems,
  isEvmOrderRef,
  areEvmOrderRefsEqual,
};

export default AccountSelectorOrderUtils;

import { CURRENT_LOCAL_STORAGE_VERSION } from '@background/hive/modules/local-storage.module';
import { AutoCompleteValue } from '@interfaces/autocomplete.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { ImportCallbackPayload } from '@interfaces/import-callback.interface';
import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { EXPORTABLE_SETTINGS_KEYS } from '@reference-data/exportable-settings.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import { ArrayUtils } from 'src/utils/array.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { ObjectUtils } from 'src/utils/object.utils';

type ImportedSettings = Record<string, unknown>;

const MERGED_LIST_SETTINGS_KEYS: LocalStorageKeyEnum[] = [
  LocalStorageKeyEnum.HIDDEN_TOKENS,
  LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
  LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
  LocalStorageKeyEnum.SETUP_CHAINS,
  LocalStorageKeyEnum.PORTFOLIO_FILTER,
];

const MERGED_RECORD_SETTINGS_KEYS: LocalStorageKeyEnum[] = [
  LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY,
  LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED,
  LocalStorageKeyEnum.PROPOSAL_SKIPPED,
  LocalStorageKeyEnum.WITNESS_LAST_SIGNING_KEY,
  LocalStorageKeyEnum.MULTISIG_CONFIG,
  LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE,
  LocalStorageKeyEnum.LAYER_TWO_AUTO_STAKE_TOKENS,
  LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_STATE,
  LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_WHITELIST,
  LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
  LocalStorageKeyEnum.EVM_ACTIVE_RPCS,
  LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
  LocalStorageKeyEnum.EVM_SWITCH_RPC_AUTO,
  LocalStorageKeyEnum.EVM_WHITELISTED_ADDRESSES,
  LocalStorageKeyEnum.EVM_CUSTOM_TOKENS,
  LocalStorageKeyEnum.EVM_HIDDEN_AUTO_DETECTED_TOKENS,
  LocalStorageKeyEnum.EVM_CUSTOM_NFTS,
  LocalStorageKeyEnum.EVM_CUSTOM_HISTORY_INFO_CARD_HIDDEN,
  LocalStorageKeyEnum.EVM_CUSTOM_ERC20_EMPTY_CARD_HIDDEN,
  LocalStorageKeyEnum.EVM_CUSTOM_NFT_EMPTY_CARD_HIDDEN,
];

const MERGED_SETTINGS_KEYS: LocalStorageKeyEnum[] = [
  LocalStorageKeyEnum.CLAIM_ACCOUNTS,
  LocalStorageKeyEnum.CLAIM_REWARDS,
  LocalStorageKeyEnum.CLAIM_SAVINGS,
  LocalStorageKeyEnum.NO_CONFIRM,
  LocalStorageKeyEnum.RPC_LIST,
  LocalStorageKeyEnum.FAVORITE_USERS,
  LocalStorageKeyEnum.CUSTOM_CHAINS,
  LocalStorageKeyEnum.EVM_ENS,
  LocalStorageKeyEnum.EVM_SAVED_ADDRESSES,
  ...MERGED_LIST_SETTINGS_KEYS,
  ...MERGED_RECORD_SETTINGS_KEYS,
];

const SKIP_IMPORT_SETTINGS_KEYS: LocalStorageKeyEnum[] = [
  LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
];

const LEGACY_JSON_STRING_SETTINGS_KEYS: LocalStorageKeyEnum[] = [
  LocalStorageKeyEnum.AUTOLOCK,
  LocalStorageKeyEnum.RPC_LIST,
  LocalStorageKeyEnum.NO_CONFIRM,
];

const DEAD_RPC_URIS = [
  'https://anyx.io',
  'https://api.pharesim.me/',
  'https://rpc.ausbit.dev',
  'https://hived.privex.io/',
];

const DEFAULT_RPC: Rpc = { uri: 'https://api.hive.blog', testnet: false };

const getImportedSettings = (fileContent: unknown): ImportedSettings => {
  if (!ObjectUtils.isPureObject(fileContent)) {
    throw new Error('Bad format or not object');
  }
  return fileContent as ImportedSettings;
};

const getImportedObject = (
  value: unknown,
): ImportedSettings | undefined => {
  if (!ObjectUtils.isPureObject(value)) {
    return undefined;
  }
  return value as ImportedSettings;
};

const ignoreUnmergeableSetting = (
  key: LocalStorageKeyEnum | string,
): void => {
  Logger.error(`Ignoring unmergeable imported setting: ${key}`);
};

const parseJsonSettingIfNeeded = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeCurrentRpc = (activeRpc: unknown): Rpc | undefined => {
  if (activeRpc === undefined) return undefined;

  let rpc: unknown = activeRpc;
  if (typeof rpc === 'string' && rpc !== 'DEFAULT') {
    rpc =
      RpcUtils.getFullList().find((candidate) => candidate.uri === rpc) ||
      RpcUtils.getFullList()[0];
  }

  if (!rpc || rpc === 'DEFAULT') {
    return RpcUtils.getFullList()[0];
  }

  if (ObjectUtils.isPureObject(rpc)) {
    const rpcObject = rpc as Rpc;
    if (rpcObject.uri === 'DEFAULT') {
      return RpcUtils.getFullList()[0];
    }
    if (DEAD_RPC_URIS.includes(rpcObject.uri)) {
      return DEFAULT_RPC;
    }
    return rpcObject;
  }

  return DEFAULT_RPC;
};

const normalizeFavoriteUserItem = (item: unknown): AutoCompleteValue => {
  if (typeof item === 'string') {
    return { label: item, subLabel: '' } as AutoCompleteValue;
  }

  if (!ObjectUtils.isPureObject(item)) {
    return { label: String(item), subLabel: '' } as AutoCompleteValue;
  }

  const favorite = item as Record<string, unknown>;
  if (typeof favorite.label === 'string') {
    return {
      label: favorite.label,
      subLabel:
        typeof favorite.subLabel === 'string' ? favorite.subLabel : '',
      ...(typeof favorite.value === 'string' ? { value: favorite.value } : {}),
    } as AutoCompleteValue;
  }

  if (typeof favorite.value === 'string') {
    return {
      label: favorite.value,
      subLabel:
        typeof favorite.subLabel === 'string' ? favorite.subLabel : '',
    } as AutoCompleteValue;
  }

  return { label: String(item), subLabel: '' } as AutoCompleteValue;
};

const normalizeFavoriteUsers = (value: unknown): unknown => {
  if (!ObjectUtils.isPureObject(value)) return value;

  const normalizedFavorites: Record<string, AutoCompleteValue[]> = {};
  for (const [username, list] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (!Array.isArray(list)) {
      continue;
    }
    normalizedFavorites[username] = list.map(normalizeFavoriteUserItem);
  }
  return normalizedFavorites;
};

const getImportedStorageVersion = (
  importedSettings: ImportedSettings,
): number | undefined => {
  const version = importedSettings[LocalStorageKeyEnum.LOCAL_STORAGE_VERSION];
  return typeof version === 'number' ? version : undefined;
};

/**
 * Applies storage-shape migrations to imported settings in memory, using the
 * file's LOCAL_STORAGE_VERSION when present. Does not write the file version
 * onto the live wallet.
 */
const normalizeImportedSettings = (
  importedSettings: ImportedSettings,
): ImportedSettings => {
  const normalized: ImportedSettings = { ...importedSettings };
  const fileVersion = getImportedStorageVersion(importedSettings);

  for (const key of LEGACY_JSON_STRING_SETTINGS_KEYS) {
    if (typeof normalized[key] !== 'string') {
      continue;
    }
    const original = normalized[key] as string;
    const parsed = parseJsonSettingIfNeeded(original);
    if (parsed !== original) {
      normalized[key] = parsed;
      continue;
    }
    const trimmed = original.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      delete normalized[key];
      ignoreUnmergeableSetting(key);
    }
  }

  if (normalized[LocalStorageKeyEnum.CURRENT_RPC] !== undefined) {
    const rpc = normalizeCurrentRpc(
      normalized[LocalStorageKeyEnum.CURRENT_RPC],
    );
    if (rpc !== undefined) {
      normalized[LocalStorageKeyEnum.CURRENT_RPC] = rpc;
    }
  }

  if (
    normalized[LocalStorageKeyEnum.FAVORITE_USERS] !== undefined &&
    !ObjectUtils.isPureObject(normalized[LocalStorageKeyEnum.FAVORITE_USERS])
  ) {
    delete normalized[LocalStorageKeyEnum.FAVORITE_USERS];
    ignoreUnmergeableSetting(LocalStorageKeyEnum.FAVORITE_USERS);
  } else if (
    normalized[LocalStorageKeyEnum.FAVORITE_USERS] !== undefined &&
    (fileVersion === undefined ||
      fileVersion < CURRENT_LOCAL_STORAGE_VERSION)
  ) {
    normalized[LocalStorageKeyEnum.FAVORITE_USERS] = normalizeFavoriteUsers(
      normalized[LocalStorageKeyEnum.FAVORITE_USERS],
    );
  }

  return normalized;
};

const mergeClaimSetting = async (
  key: LocalStorageKeyEnum,
  importedValue: unknown,
): Promise<void> => {
  if (importedValue === undefined) return;

  const importedClaims = getImportedObject(importedValue) as
    | LocalStorageClaimItem
    | undefined;
  if (!importedClaims) {
    ignoreUnmergeableSetting(key);
    return;
  }

  const existingClaims: LocalStorageClaimItem =
    (await LocalStorageUtils.getValueFromLocalStorage(key)) ?? {};
  await LocalStorageUtils.saveValueInLocalStorage(key, {
    ...existingClaims,
    ...importedClaims,
  });
};

const mergeNoConfirm = async (importedValue: unknown): Promise<void> => {
  if (importedValue === undefined) return;

  const importedNoConfirm = getImportedObject(importedValue) as
    | NoConfirm
    | undefined;
  if (!importedNoConfirm) {
    ignoreUnmergeableSetting(LocalStorageKeyEnum.NO_CONFIRM);
    return;
  }

  const existingNoConfirm: NoConfirm =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
    )) ?? {};

  for (const username of Object.keys(importedNoConfirm)) {
    if (!existingNoConfirm[username]) existingNoConfirm[username] = {};
    for (const website of Object.keys(importedNoConfirm[username] ?? {})) {
      existingNoConfirm[username][website] =
        importedNoConfirm[username][website];
    }
  }
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.NO_CONFIRM,
    existingNoConfirm,
  );
};

const mergeRpcList = async (importedValue: unknown): Promise<void> => {
  if (importedValue === undefined) return;
  if (!Array.isArray(importedValue)) {
    ignoreUnmergeableSetting(LocalStorageKeyEnum.RPC_LIST);
    return;
  }

  const existingRpc: Rpc[] =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.RPC_LIST,
    )) ?? [];
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.RPC_LIST,
    ArrayUtils.mergeWithoutDuplicate(existingRpc, importedValue as Rpc[], 'uri'),
  );
};

const mergeFavoriteUsers = async (importedValue: unknown): Promise<void> => {
  if (importedValue === undefined) return;

  const importedFavoriteUsers = getImportedObject(importedValue) as
    | FavoriteUserItems
    | undefined;
  if (!importedFavoriteUsers) {
    ignoreUnmergeableSetting(LocalStorageKeyEnum.FAVORITE_USERS);
    return;
  }

  const existingFavoriteUsers: FavoriteUserItems =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    )) ?? {};

  for (const username of Object.keys(importedFavoriteUsers)) {
    const importedList = importedFavoriteUsers[username];
    if (!Array.isArray(importedList)) {
      continue;
    }
    existingFavoriteUsers[username] = [
      ...(existingFavoriteUsers[username] ?? []),
      ...importedList,
    ];
  }
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
    existingFavoriteUsers,
  );
};

const mergeListSetting = async (
  key: LocalStorageKeyEnum,
  importedValue: unknown,
): Promise<void> => {
  if (importedValue === undefined) return;
  if (!Array.isArray(importedValue)) {
    ignoreUnmergeableSetting(key);
    return;
  }

  const existingList =
    (await LocalStorageUtils.getValueFromLocalStorage(key)) ?? [];
  await LocalStorageUtils.saveValueInLocalStorage(
    key,
    ArrayUtils.mergeWithoutDuplicate(existingList, importedValue),
  );
};

const mergeRecordSetting = async (
  key: LocalStorageKeyEnum,
  importedValue: unknown,
): Promise<void> => {
  if (importedValue === undefined) return;

  const importedRecord = getImportedObject(importedValue);
  if (!importedRecord) {
    ignoreUnmergeableSetting(key);
    return;
  }

  const existingValue = await LocalStorageUtils.getValueFromLocalStorage(key);
  const existingRecord = ObjectUtils.isPureObject(existingValue)
    ? (existingValue as ImportedSettings)
    : {};
  await LocalStorageUtils.saveValueInLocalStorage(key, {
    ...existingRecord,
    ...importedRecord,
  });
};

const mergeKeyedListSetting = async (
  key: LocalStorageKeyEnum,
  importedValue: unknown,
  itemKey: string,
): Promise<void> => {
  if (importedValue === undefined) return;
  if (!Array.isArray(importedValue)) {
    ignoreUnmergeableSetting(key);
    return;
  }

  const existingValue = await LocalStorageUtils.getValueFromLocalStorage(key);
  const existingList = Array.isArray(existingValue) ? existingValue : [];
  await LocalStorageUtils.saveValueInLocalStorage(
    key,
    ArrayUtils.mergeWithoutDuplicate(existingList, importedValue, itemKey),
  );
};

const mergeEvmEns = async (importedValue: unknown): Promise<void> => {
  if (importedValue === undefined) return;
  if (!Array.isArray(importedValue)) {
    ignoreUnmergeableSetting(LocalStorageKeyEnum.EVM_ENS);
    return;
  }

  const existingValue = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ENS,
  );
  const existingList = Array.isArray(existingValue) ? existingValue : [];
  const mergedList = [...existingList];

  for (const importedEntry of importedValue) {
    if (
      !ObjectUtils.isPureObject(importedEntry) ||
      typeof (importedEntry as { address?: unknown }).address !== 'string'
    ) {
      continue;
    }

    const importedAddress = (
      importedEntry as { address: string }
    ).address.toLowerCase();
    const alreadyPresent = mergedList.some(
      (existingEntry) =>
        ObjectUtils.isPureObject(existingEntry) &&
        typeof (existingEntry as { address?: unknown }).address === 'string' &&
        (existingEntry as { address: string }).address.toLowerCase() ===
          importedAddress,
    );

    if (!alreadyPresent) {
      mergedList.push(importedEntry);
    }
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ENS,
    mergedList,
  );
};

const mergeEvmSavedAddresses = async (
  importedValue: unknown,
): Promise<void> => {
  if (importedValue === undefined) return;

  const importedRecord = getImportedObject(importedValue);
  if (!importedRecord) {
    ignoreUnmergeableSetting(LocalStorageKeyEnum.EVM_SAVED_ADDRESSES);
    return;
  }

  const existingValue = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_SAVED_ADDRESSES,
  );
  const existingRecord = ObjectUtils.isPureObject(existingValue)
    ? (existingValue as ImportedSettings)
    : {};
  const mergedRecord: ImportedSettings = { ...existingRecord };

  for (const [chainId, addresses] of Object.entries(importedRecord)) {
    if (!ObjectUtils.isPureObject(addresses)) {
      continue;
    }

    const existingAddresses = ObjectUtils.isPureObject(mergedRecord[chainId])
      ? (mergedRecord[chainId] as ImportedSettings)
      : {};
    mergedRecord[chainId] = {
      ...existingAddresses,
      ...(addresses as ImportedSettings),
    };
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_SAVED_ADDRESSES,
    mergedRecord,
  );
};

const importSupportedSettings = async (
  importedSettings: ImportedSettings,
): Promise<void> => {
  const settings = normalizeImportedSettings(importedSettings);

  for (const key of EXPORTABLE_SETTINGS_KEYS) {
    if (
      MERGED_SETTINGS_KEYS.includes(key) ||
      SKIP_IMPORT_SETTINGS_KEYS.includes(key) ||
      settings[key] === undefined
    ) {
      continue;
    }
    await LocalStorageUtils.saveValueInLocalStorage(key, settings[key]);
  }

  await mergeClaimSetting(
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    settings[LocalStorageKeyEnum.CLAIM_ACCOUNTS],
  );
  await mergeClaimSetting(
    LocalStorageKeyEnum.CLAIM_REWARDS,
    settings[LocalStorageKeyEnum.CLAIM_REWARDS],
  );
  await mergeClaimSetting(
    LocalStorageKeyEnum.CLAIM_SAVINGS,
    settings[LocalStorageKeyEnum.CLAIM_SAVINGS],
  );
  await mergeNoConfirm(settings[LocalStorageKeyEnum.NO_CONFIRM]);
  await mergeRpcList(settings[LocalStorageKeyEnum.RPC_LIST]);
  await mergeFavoriteUsers(settings[LocalStorageKeyEnum.FAVORITE_USERS]);
  for (const key of MERGED_LIST_SETTINGS_KEYS) {
    await mergeListSetting(key, settings[key]);
  }
  for (const key of MERGED_RECORD_SETTINGS_KEYS) {
    await mergeRecordSetting(key, settings[key]);
  }
  await mergeKeyedListSetting(
    LocalStorageKeyEnum.CUSTOM_CHAINS,
    settings[LocalStorageKeyEnum.CUSTOM_CHAINS],
    'chainId',
  );
  await mergeEvmEns(settings[LocalStorageKeyEnum.EVM_ENS]);
  await mergeEvmSavedAddresses(settings[LocalStorageKeyEnum.EVM_SAVED_ADDRESSES]);
};

const importSettings = async (fileContent: unknown): Promise<void> => {
  await importSupportedSettings(getImportedSettings(fileContent));
};

const isLegacyNoConfirmImport = (
  importedSettings: ImportedSettings,
): boolean => {
  const firstKey = Object.keys(importedSettings)[0];
  return (
    !!firstKey &&
    !Object.values(LocalStorageKeyEnum).includes(
      firstKey as LocalStorageKeyEnum,
    )
  );
};

const sendBackImportedFileContent = async (fileContent: unknown) => {
  try {
    const importedSettings = getImportedSettings(fileContent);
    if (isLegacyNoConfirmImport(importedSettings)) {
      await mergeNoConfirm(importedSettings);
    } else {
      await importSupportedSettings(importedSettings);
    }

    const response: ImportCallbackPayload = {
      success: true,
      message: 'html_popup_import_settings_successful',
    };
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
      value: response,
    });
  } catch (err) {
    Logger.error(err);
    const response: ImportCallbackPayload = {
      success: false,
      message: 'html_popup_import_settings_error',
    };
    CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.IMPORT_SETTINGS_CALLBACK,
      value: response,
    });
  }
};

const SettingsModule = {
  importSettings,
  sendBackImportedFileContent,
};

export default SettingsModule;

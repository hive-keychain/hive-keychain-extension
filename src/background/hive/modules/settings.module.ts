import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { ImportCallbackPayload } from '@interfaces/import-callback.interface';
import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { EXPORTABLE_SETTINGS_KEYS } from '@reference-data/exportable-settings.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
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
  ...MERGED_LIST_SETTINGS_KEYS,
  ...MERGED_RECORD_SETTINGS_KEYS,
];

const getImportedSettings = (fileContent: unknown): ImportedSettings => {
  if (!ObjectUtils.isPureObject(fileContent)) {
    throw new Error('Bad format or not object');
  }
  return fileContent as ImportedSettings;
};

const getImportedObject = (value: unknown): ImportedSettings => {
  if (!ObjectUtils.isPureObject(value)) {
    throw new Error('Bad settings value');
  }
  return value as ImportedSettings;
};

const mergeClaimSetting = async (
  key: LocalStorageKeyEnum,
  importedValue: unknown,
): Promise<void> => {
  if (importedValue === undefined) return;

  const importedClaims = getImportedObject(
    importedValue,
  ) as unknown as LocalStorageClaimItem;
  const existingClaims: LocalStorageClaimItem =
    (await LocalStorageUtils.getValueFromLocalStorage(key)) ?? {};
  await LocalStorageUtils.saveValueInLocalStorage(key, {
    ...existingClaims,
    ...importedClaims,
  });
};

const mergeNoConfirm = async (importedValue: unknown): Promise<void> => {
  if (importedValue === undefined) return;

  const importedNoConfirm = getImportedObject(
    importedValue,
  ) as unknown as NoConfirm;
  const existingNoConfirm: NoConfirm =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
    )) ?? {};

  for (const username of Object.keys(importedNoConfirm)) {
    if (!existingNoConfirm[username]) existingNoConfirm[username] = {};
    for (const website of Object.keys(importedNoConfirm[username])) {
      existingNoConfirm[username][website] = importedNoConfirm[username][website];
    }
  }
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.NO_CONFIRM,
    existingNoConfirm,
  );
};

const mergeRpcList = async (importedValue: unknown): Promise<void> => {
  if (importedValue === undefined) return;
  if (!Array.isArray(importedValue)) throw new Error('Bad settings value');

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

  const importedFavoriteUsers = getImportedObject(
    importedValue,
  ) as unknown as FavoriteUserItems;
  const existingFavoriteUsers: FavoriteUserItems =
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    )) ?? {};

  for (const username of Object.keys(importedFavoriteUsers)) {
    existingFavoriteUsers[username] = [
      ...(existingFavoriteUsers[username] ?? []),
      ...importedFavoriteUsers[username],
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
  if (!Array.isArray(importedValue)) throw new Error('Bad settings value');

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
  if (!Array.isArray(importedValue)) throw new Error('Bad settings value');

  const existingValue = await LocalStorageUtils.getValueFromLocalStorage(key);
  const existingList = Array.isArray(existingValue) ? existingValue : [];
  await LocalStorageUtils.saveValueInLocalStorage(
    key,
    ArrayUtils.mergeWithoutDuplicate(existingList, importedValue, itemKey),
  );
};

const importSupportedSettings = async (
  importedSettings: ImportedSettings,
): Promise<void> => {
  for (const key of EXPORTABLE_SETTINGS_KEYS) {
    if (
      MERGED_SETTINGS_KEYS.includes(key) ||
      importedSettings[key] === undefined
    ) {
      continue;
    }
    await LocalStorageUtils.saveValueInLocalStorage(
      key,
      importedSettings[key],
    );
  }

  await mergeClaimSetting(
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    importedSettings[LocalStorageKeyEnum.CLAIM_ACCOUNTS],
  );
  await mergeClaimSetting(
    LocalStorageKeyEnum.CLAIM_REWARDS,
    importedSettings[LocalStorageKeyEnum.CLAIM_REWARDS],
  );
  await mergeClaimSetting(
    LocalStorageKeyEnum.CLAIM_SAVINGS,
    importedSettings[LocalStorageKeyEnum.CLAIM_SAVINGS],
  );
  await mergeNoConfirm(importedSettings[LocalStorageKeyEnum.NO_CONFIRM]);
  await mergeRpcList(importedSettings[LocalStorageKeyEnum.RPC_LIST]);
  await mergeFavoriteUsers(
    importedSettings[LocalStorageKeyEnum.FAVORITE_USERS],
  );
  for (const key of MERGED_LIST_SETTINGS_KEYS) {
    await mergeListSetting(key, importedSettings[key]);
  }
  for (const key of MERGED_RECORD_SETTINGS_KEYS) {
    await mergeRecordSetting(key, importedSettings[key]);
  }
  await mergeKeyedListSetting(
    LocalStorageKeyEnum.CUSTOM_CHAINS,
    importedSettings[LocalStorageKeyEnum.CUSTOM_CHAINS],
    'chainId',
  );
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

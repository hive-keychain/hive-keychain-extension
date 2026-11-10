import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';

export const MANAGE_EVM_SELECTED_SEED_ID_PARAM = 'manageEvmSelectedSeedId';
export const MANAGE_EVM_SELECTED_ADDRESS_ID_PARAM = 'manageEvmSelectedAddressId';

export interface EvmAccountsPageParams {
  seedId?: number;
  addressId?: number;
  [MANAGE_EVM_SELECTED_SEED_ID_PARAM]?: number;
  [MANAGE_EVM_SELECTED_ADDRESS_ID_PARAM]?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseNumericParam = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

export const getRestoredEvmAccountsSeedId = (
  params: unknown,
  accounts: EvmAccount[],
): number | undefined => {
  if (!isRecord(params)) {
    return undefined;
  }

  const candidateSeedId =
    parseNumericParam(params[MANAGE_EVM_SELECTED_SEED_ID_PARAM]) ??
    parseNumericParam(params.seedId);

  if (
    candidateSeedId !== undefined &&
    accounts.some((account) => account.seedId === candidateSeedId)
  ) {
    return candidateSeedId;
  }

  return undefined;
};

export const getEvmAccountsDefaultSeedOption = (
  accounts: EvmAccount[],
  seedOptions: OptionItem[],
  navigationParams?: unknown,
  previousParams?: unknown,
): OptionItem | undefined => {
  const fromNavigation = getRestoredEvmAccountsSeedId(
    navigationParams,
    accounts,
  );
  const fromPrevious = getRestoredEvmAccountsSeedId(previousParams, accounts);
  const restoredSeedId = fromNavigation ?? fromPrevious;

  if (restoredSeedId !== undefined) {
    return (
      seedOptions.find((option) => option.value === restoredSeedId) ??
      seedOptions[0]
    );
  }

  return seedOptions[0];
};

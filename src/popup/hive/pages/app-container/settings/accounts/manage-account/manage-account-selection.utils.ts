import { LocalAccount } from 'src/interfaces/local-account.interface';

export const MANAGE_ACCOUNT_SELECTED_NAME_PARAM = 'manageAccountSelectedName';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const getRestoredManageAccountSelection = (
  previousParams: unknown,
  localAccounts: LocalAccount[],
): string | undefined => {
  if (!isRecord(previousParams)) {
    return undefined;
  }

  const candidateName =
    (previousParams[MANAGE_ACCOUNT_SELECTED_NAME_PARAM] as string) ??
    (previousParams.username as string);

  if (
    candidateName &&
    localAccounts.some((account) => account.name === candidateName)
  ) {
    return candidateName;
  }

  return undefined;
};

export const getInitialManageAccountSelection = (
  activeAccountName: string | undefined,
  localAccounts: LocalAccount[],
  restoredAccountName?: string,
): string => {
  if (restoredAccountName) {
    return restoredAccountName;
  }
  return activeAccountName ?? localAccounts[0]?.name ?? '';
};

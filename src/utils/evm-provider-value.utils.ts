const normalizeAccount = (account: unknown): string | null => {
  if (typeof account !== 'string') return null;

  const normalizedAccount = account.toLowerCase();
  return normalizedAccount.length ? normalizedAccount : null;
};

export const normalizeEvmAccounts = (accounts: unknown): string[] => {
  if (!Array.isArray(accounts)) return [];

  const seenAccounts = new Set<string>();
  const normalizedAccounts: string[] = [];

  for (const account of accounts) {
    const normalizedAccount = normalizeAccount(account);
    if (!normalizedAccount || seenAccounts.has(normalizedAccount)) {
      continue;
    }

    seenAccounts.add(normalizedAccount);
    normalizedAccounts.push(normalizedAccount);
  }

  return normalizedAccounts;
};

export const areEvmAccountsEqual = (
  left: unknown,
  right: unknown,
): boolean => {
  const normalizedLeft = normalizeEvmAccounts(left);
  const normalizedRight = normalizeEvmAccounts(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((account, index) => {
    return normalizedRight[index] === account;
  });
};

export const normalizeEvmChainId = (chainId: unknown): string | null => {
  if (typeof chainId !== 'string') return null;

  const normalizedChainId = chainId.toLowerCase();
  return normalizedChainId.length ? normalizedChainId : null;
};

export const areEvmChainIdsEqual = (
  left: unknown,
  right: unknown,
): boolean => {
  return normalizeEvmChainId(left) === normalizeEvmChainId(right);
};

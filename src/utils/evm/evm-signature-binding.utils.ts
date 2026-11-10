export type ChainIdBinding = 'match' | 'mismatch' | 'absent';

export type ParsedSiweMessage = {
  domain: string;
  uri: string;
  uriOrigin: string | null;
  chainId: string;
};

export type SiweBindingContext = {
  domain: string;
  origin: string;
  chainId: string;
};

export type SiweBindingIssue =
  | { kind: 'domain'; stated: string; actual: string }
  | { kind: 'uri'; stated: string; actual: string }
  | { kind: 'chain'; stated: string; actual: string };

const SPENDING_PERMIT_PRIMARY_TYPES = new Set([
  'Permit',
  'PermitSingle',
  'PermitBatch',
  'PermitWitnessTransferFrom',
  'PermitTransferFrom',
  'PermitBatchTransferFrom',
]);

const SIWE_HEADER_PATTERN =
  /^(.+) wants you to sign in with your Ethereum account:$/;

const parseChainId = (value: unknown): bigint | null => {
  if (typeof value === 'bigint') {
    return value >= BigInt(0) ? value : null;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
      return null;
    }
    return BigInt(value);
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^0x[0-9a-fA-F]+$/.test(trimmed) || /^[0-9]+$/.test(trimmed)) {
    try {
      return BigInt(trimmed);
    } catch {
      return null;
    }
  }

  return null;
};

const compareChainIds = (
  requested: unknown,
  connected: unknown,
): ChainIdBinding => {
  const requestedChainId = parseChainId(requested);
  const connectedChainId = parseChainId(connected);
  if (requestedChainId === null || connectedChainId === null) {
    return 'absent';
  }
  return requestedChainId === connectedChainId ? 'match' : 'mismatch';
};

const toHexChainId = (value: unknown): string | null => {
  const chainId = parseChainId(value);
  if (chainId === null) {
    return null;
  }
  return `0x${chainId.toString(16)}`;
};

const toDecimalChainId = (value: unknown): string | null => {
  const chainId = parseChainId(value);
  if (chainId === null) {
    return null;
  }
  return chainId.toString();
};

const isSpendingPermitPrimaryType = (
  primaryType: string | undefined,
): boolean => {
  return !!primaryType && SPENDING_PERMIT_PRIMARY_TYPES.has(primaryType);
};

const readSiweField = (lines: string[], name: string): string | null => {
  const prefix = `${name}:`;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(prefix)) {
      continue;
    }
    const value = trimmed.slice(prefix.length).trim();
    return value.length ? value : null;
  }
  return null;
};

const hostnameFromAuthority = (authority: string): string | null => {
  const trimmed = authority.trim().replace(/\.$/, '');
  if (!trimmed) {
    return null;
  }

  try {
    const url = trimmed.includes('://')
      ? new URL(trimmed)
      : new URL(`http://${trimmed}`);
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
};

const parseSiweMessage = (text: string): ParsedSiweMessage | null => {
  if (typeof text !== 'string') {
    return null;
  }

  const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
  const header = lines[0]?.trim().match(SIWE_HEADER_PATTERN);
  const domain = header?.[1]?.trim();
  if (!domain) {
    return null;
  }

  const uri = readSiweField(lines, 'URI');
  const chainId = readSiweField(lines, 'Chain ID');
  if (!uri || !chainId) {
    return null;
  }

  let uriOrigin: string | null = null;
  try {
    uriOrigin = new URL(uri).origin;
  } catch {
    uriOrigin = null;
  }

  return { domain, uri, uriOrigin, chainId };
};

const normalizeOrigin = (origin: string): string | null => {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
};

const getSiweBindingIssues = (
  parsed: ParsedSiweMessage,
  context: SiweBindingContext,
): SiweBindingIssue[] => {
  const issues: SiweBindingIssue[] = [];
  const statedHost = hostnameFromAuthority(parsed.domain);
  const actualHost = hostnameFromAuthority(context.domain);
  const hostsMatch =
    statedHost !== null && actualHost !== null
      ? statedHost === actualHost
      : parsed.domain.trim().toLowerCase() ===
        context.domain.trim().toLowerCase();
  if (!hostsMatch) {
    issues.push({
      kind: 'domain',
      stated: parsed.domain,
      actual: context.domain,
    });
  }

  const statedOrigin = parsed.uriOrigin ?? normalizeOrigin(parsed.uri);
  const actualOrigin = normalizeOrigin(context.origin);
  if (
    !statedOrigin ||
    !actualOrigin ||
    statedOrigin.toLowerCase() !== actualOrigin.toLowerCase()
  ) {
    issues.push({
      kind: 'uri',
      stated: parsed.uri,
      actual: context.origin,
    });
  }

  if (compareChainIds(parsed.chainId, context.chainId) === 'mismatch') {
    issues.push({
      kind: 'chain',
      stated: parsed.chainId,
      actual: context.chainId,
    });
  }

  return issues;
};

export const EvmSignatureBindingUtils = {
  compareChainIds,
  toHexChainId,
  toDecimalChainId,
  isSpendingPermitPrimaryType,
  parseSiweMessage,
  getSiweBindingIssues,
};

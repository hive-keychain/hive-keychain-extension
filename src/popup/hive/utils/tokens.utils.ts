import { ActiveAccount } from '@interfaces/active-account.interface';
import { Key, KeyType, TransactionOptions } from '@interfaces/keys.interface';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import {
  PendingUnstaking,
  Token,
  TokenBalance,
  TokenMarket,
} from '@interfaces/tokens.interface';
import { Currency } from 'hive-keychain-commons';
import Config from 'src/config';
import { CustomJsonUtils } from 'src/popup/hive/utils/custom-json.utils';
import { HiveEngineUtils } from 'src/popup/hive/utils/hive-engine.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { TokenRequestParams } from 'src/popup/hive/utils/token-request-params.interface';
/* istanbul ignore next */
const stakeToken = (
  to: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
  options?: TransactionOptions,
) => {
  return HiveEngineUtils.sendOperation(
    [TokensUtils.getStakeTokenOperation(to, symbol, amount, username)],
    activeKey,
    options,
  );
};
/* istanbul ignore next */
const getStakeTokenOperation = (
  to: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  const json = {
    contractName: 'tokens',
    contractAction: 'stake',
    contractPayload: { to: to, symbol: symbol, quantity: amount },
  };
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};
/* istanbul ignore next */
const getStakeTokenTransaction = (
  to: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  return HiveTxUtils.createTransaction([
    TokensUtils.getStakeTokenOperation(to, symbol, amount, username),
  ]);
};
/* istanbul ignore next */
const unstakeToken = (
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
  options?: TransactionOptions,
) => {
  return HiveEngineUtils.sendOperation(
    [TokensUtils.getUnstakeTokenOperation(symbol, amount, username)],
    activeKey,
    options,
  );
};

/* istanbul ignore next */
const cancelUnstakeToken = (
  transactionId: string,
  activeAccount: ActiveAccount,
  options?: TransactionOptions,
) => {
  return HiveEngineUtils.sendOperation(
    [
      TokensUtils.getCancelUnstakeTokenOperation(
        transactionId,
        activeAccount.name!,
      ),
    ],
    activeAccount.keys.active!,
    options,
  );
};

const getCancelUnstakeTokenOperation = (
  transactionId: string,
  username: string,
) => {
  const json = {
    contractName: 'tokens',
    contractAction: 'cancelUnstake',
    contractPayload: { txId: transactionId },
  };
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};

/* istanbul ignore next */
const getUnstakeTokenOperation = (
  symbol: string,
  amount: string,
  username: string,
) => {
  const json = {
    contractName: 'tokens',
    contractAction: 'unstake',
    contractPayload: { symbol: symbol, quantity: amount },
  };
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};
/* istanbul ignore next */
const getUnstakeTokenTransaction = (
  symbol: string,
  amount: string,
  username: string,
) => {
  return HiveTxUtils.createTransaction([
    TokensUtils.getUnstakeTokenOperation(symbol, amount, username),
  ]);
};
/* istanbul ignore next */
const delegateToken = (
  to: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
  options?: TransactionOptions,
) => {
  return HiveEngineUtils.sendOperation(
    [TokensUtils.getDelegateTokenOperation(to, symbol, amount, username)],
    activeKey,
    options,
  );
};
/* istanbul ignore next */
const getDelegateTokenOperation = (
  to: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  const json = {
    contractName: 'tokens',
    contractAction: 'delegate',
    contractPayload: { to: to, symbol: symbol, quantity: amount },
  };
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};
/* istanbul ignore next */
const getDelegateTokenTransaction = (
  to: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  return HiveTxUtils.createTransaction([
    TokensUtils.getDelegateTokenOperation(to, symbol, amount, username),
  ]);
};
/* istanbul ignore next */
const cancelDelegationToken = (
  from: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
  options?: TransactionOptions,
) => {
  return HiveEngineUtils.sendOperation(
    [
      TokensUtils.getCancelDelegationTokenOperation(
        from,
        symbol,
        amount,
        username,
      ),
    ],
    activeKey,
    options,
  );
};
/* istanbul ignore next */
const getCancelDelegationTokenOperation = (
  from: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  const json = {
    contractName: 'tokens',
    contractAction: 'undelegate',
    contractPayload: { from: from, symbol: symbol, quantity: amount },
  };
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};
/* istanbul ignore next */
const getCancelDelegationTokenTransaction = (
  from: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  return HiveTxUtils.createTransaction([
    TokensUtils.getCancelDelegationTokenOperation(
      from,
      symbol,
      amount,
      username,
    ),
  ]);
};
/* istanbul ignore next */
const sendToken = (
  currency: string,
  to: string,
  amount: string,
  memo: string,
  activeKey: Key,
  username: string,
  options?: TransactionOptions,
) => {
  return HiveEngineUtils.sendOperation(
    [TokensUtils.getSendTokenOperation(currency, to, amount, memo, username)],
    activeKey,
    options,
  );
};
/* istanbul ignore next */
const getSendTokenOperation = (
  currency: string,
  to: string,
  amount: string,
  memo: string,
  username: string,
) => {
  const json = {
    contractName: 'tokens',
    contractAction: 'transfer',
    contractPayload: {
      symbol: currency,
      to: to,
      quantity: amount,
      memo: memo,
    },
  };
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};
/* istanbul ignore next */
const getSendTokenTransaction = (
  currency: string,
  to: string,
  amount: string,
  memo: string,
  username: string,
) => {
  return HiveTxUtils.createTransaction([
    TokensUtils.getSendTokenOperation(currency, to, amount, memo, username),
  ]);
};

const getHiveEngineTokenPrice = (
  { symbol }: Partial<TokenBalance>,
  market: TokenMarket[],
) => {
  const tokenMarket = market.find((t) => t.symbol === symbol);
  const price = tokenMarket
    ? parseFloat(tokenMarket.lastPrice)
    : symbol === 'SWAP.HIVE'
    ? 1
    : 0;
  return price;
};

const getHiveEngineTokenValue = (
  balance: TokenBalance,
  market: TokenMarket[],
  hive: Currency = { usd: 1 },
  tokens?: Token[],
) => {
  const tokenMarket = market.find((t) => t.symbol === balance.symbol);
  const token = tokens?.find((t) => t.symbol === balance.symbol);
  if (Number(tokenMarket?.volume) <= 0) return 0;
  const price = tokenMarket
    ? parseFloat(tokenMarket.lastPrice)
    : balance.symbol === 'SWAP.HIVE'
    ? 1
    : 0;

  const totalToken =
    parseFloat(balance.balance) +
    parseFloat(balance.pendingUndelegations) +
    parseFloat(balance.pendingUnstake) / (token?.numberTransactions || 1) +
    parseFloat(balance.delegationsOut) +
    parseFloat(balance.stake);
  return totalToken * price * hive?.usd!;
};
/* istanbul ignore next */
const getUserBalance = (account: string) => {
  return HiveEngineUtils.get<TokenBalance[]>({
    contract: 'tokens',
    table: 'balances',
    query: { account: account },
    indexes: [],
    limit: 1000,
    offset: 0,
  });
};
/* istanbul ignore next */
const getIncomingDelegations = async (
  symbol: string,
  username: string,
): Promise<TokenDelegation[]> => {
  return HiveEngineUtils.get<TokenDelegation[]>({
    contract: 'tokens',
    table: 'delegations',
    query: { to: username, symbol: symbol },
    indexes: [],
    limit: 1000,
    offset: 0,
  });
};
/* istanbul ignore next */
const getOutgoingDelegations = async (
  symbol: string,
  username: string,
): Promise<TokenDelegation[]> => {
  return HiveEngineUtils.get<TokenDelegation[]>({
    contract: 'tokens',
    table: 'delegations',
    query: { from: username, symbol: symbol },
    indexes: [],
    limit: 1000,
    offset: 0,
  });
};

/* istanbul ignore next */
/**
 * SSCJS request using HiveEngineConfigUtils.getApi().find.
 * @param {string} contract Fixed as 'tokens'
 * @param {string} table Fixed as 'tokens
 */
const getAllTokens = async (): Promise<Token[]> => {
  let tokens = [];
  let offset = 0;
  let newTokens;
  do {
    newTokens = await getTokens(offset);
    tokens.push(...newTokens);
    offset += 1000;
  } while (tokens.length % 1000 === 0 && newTokens.length);
  return tokens;
};

const getTokens = async (offset: number) => {
  return (
    await HiveEngineUtils.get<any[]>({
      contract: 'tokens',
      table: 'tokens',
      query: {},
      limit: 1000,
      offset: offset,
      indexes: [],
    })
  ).map((t: any) => {
    return {
      ...t,
      metadata: JSON.parse(t.metadata),
    };
  });
};

const getTokenInfo = async (symbol: string): Promise<Token> => {
  return (
    await HiveEngineUtils.get<any[]>({
      contract: 'tokens',
      table: 'tokens',
      query: { symbol: symbol },
      limit: 1000,
      offset: 0,
      indexes: [],
    })
  ).map((t: any) => {
    return {
      ...t,
      metadata: JSON.parse(t.metadata),
    };
  })[0];
};

const getPendingUnstakes = async (
  account: string,
): Promise<PendingUnstaking[]> => {
  return HiveEngineUtils.get<PendingUnstaking[]>({
    contract: 'tokens',
    table: 'pendingUnstakes',
    query: { account },
    limit: 1000,
    offset: 0,
    indexes: [],
  });
};

/* istanbul ignore next */
/**
 * SSCJS request using HiveEngineConfigUtils.getApi().find.
 * @param {string} contract Fixed as 'market'
 * @param {string} table Fixed as 'metrics
 */
const getTokensMarket = async (
  query: {},
  limit: number,
  offset: number,
  indexes: {}[],
): Promise<TokenMarket[]> => {
  return HiveEngineUtils.get<TokenMarket[]>({
    contract: 'market',
    table: 'metrics',
    query: query,
    limit: limit,
    offset: offset,
    indexes: indexes,
  } as TokenRequestParams);
};

const getTokenPrecision = async (symbol: string) => {
  if (symbol === 'HBD' || symbol === 'HIVE') {
    return 3;
  }
  const token = await getTokenInfo(symbol);
  return token.precision;
};

const TokensUtils = {
  sendToken,
  stakeToken,
  unstakeToken,
  delegateToken,
  cancelDelegationToken,
  getUserBalance,
  getIncomingDelegations,
  getOutgoingDelegations,
  getAllTokens,
  getTokensMarket,
  getHiveEngineTokenValue,
  getStakeTokenOperation,
  getUnstakeTokenOperation,
  getDelegateTokenOperation,
  getCancelDelegationTokenOperation,
  getSendTokenOperation,
  getStakeTokenTransaction,
  getUnstakeTokenTransaction,
  getDelegateTokenTransaction,
  getCancelDelegationTokenTransaction,
  getSendTokenTransaction,
  getHiveEngineTokenPrice,
  getTokenInfo,
  getTokenPrecision,
  getPendingUnstakes,
  cancelUnstakeToken,
  getCancelUnstakeTokenOperation,
};

export default TokensUtils;

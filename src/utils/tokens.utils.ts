import { Key, KeyType } from '@interfaces/keys.interface';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import Config from 'src/config';
import { CustomJsonUtils } from 'src/utils/custom-json.utils';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import { TokenRequestParams } from 'src/utils/token-request-params.interface';

const stakeToken = (
  to: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
) => {
  return HiveEngineUtils.sendOperation(
    [TokensUtils.getStakeTokenOperation(to, symbol, amount, username)],
    activeKey,
  );
};

const getStakeTokenOperation = (
  to: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'stake',
    contractPayload: { to: to, symbol: symbol, quantity: amount },
  });
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};

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

const unstakeToken = (
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
) => {
  return HiveEngineUtils.sendOperation(
    [TokensUtils.getUnstakeTokenOperation(symbol, amount, username)],
    activeKey,
  );
};

const getUnstakeTokenOperation = (
  symbol: string,
  amount: string,
  username: string,
) => {
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'unstake',
    contractPayload: { symbol: symbol, quantity: amount },
  });
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};

const getUnstakeTokenTransaction = (
  symbol: string,
  amount: string,
  username: string,
) => {
  return HiveTxUtils.createTransaction([
    TokensUtils.getUnstakeTokenOperation(symbol, amount, username),
  ]);
};

const delegateToken = (
  to: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
) => {
  return HiveEngineUtils.sendOperation(
    [TokensUtils.getDelegateTokenOperation(to, symbol, amount, username)],
    activeKey,
  );
};

const getDelegateTokenOperation = (
  to: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'delegate',
    contractPayload: { to: to, symbol: symbol, quantity: amount },
  });
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};

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

const cancelDelegationToken = (
  from: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
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
  );
};

const getCancelDelegationTokenOperation = (
  from: string,
  symbol: string,
  amount: string,
  username: string,
) => {
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'undelegate',
    contractPayload: { from: from, symbol: symbol, quantity: amount },
  });
  return CustomJsonUtils.getCustomJsonOperation(
    json,
    username,
    KeyType.ACTIVE,
    Config.hiveEngine.mainnet,
  );
};

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

const sendToken = (
  currency: string,
  to: string,
  amount: string,
  memo: string,
  activeKey: Key,
  username: string,
) => {
  return HiveEngineUtils.sendOperation(
    [TokensUtils.getSendTokenOperation(currency, to, amount, memo, username)],
    activeKey,
  );
};

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

const getHiveEngineTokenValue = (
  balance: TokenBalance,
  market: TokenMarket[],
) => {
  const tokenMarket = market.find((t) => t.symbol === balance.symbol);
  const price = tokenMarket
    ? parseFloat(tokenMarket.lastPrice)
    : balance.symbol === 'SWAP.HIVE'
    ? 1
    : 0;
  return parseFloat(balance.balance) * price;
};

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

/**
 * SSCJS request using HiveEngineConfigUtils.getApi().find.
 * @param {string} contract Fixed as 'tokens'
 * @param {string} table Fixed as 'tokens
 */
const getAllTokens = async (
  query: {},
  limit: number,
  offset: number,
  indexes: {}[],
): Promise<any[]> => {
  return HiveEngineUtils.get<any[]>({
    contract: 'tokens',
    table: 'tokens',
    query,
    limit,
    offset,
    indexes,
  });
};
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
};

export default TokensUtils;

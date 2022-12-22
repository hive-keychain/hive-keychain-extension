import { Key, KeyType } from '@interfaces/keys.interface';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import Config from 'src/config';
import { CustomJsonUtils } from 'src/utils/custom-json.utils';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';

const stakeToken = (
  to: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
) => {
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'stake',
    contractPayload: { to: to, symbol: symbol, quantity: amount },
  });
  return HiveEngineUtils.sendOperation(
    [
      CustomJsonUtils.getCustomJsonOperation(
        json,
        username,
        KeyType.ACTIVE,
        Config.hiveEngine.mainnet,
      ),
    ],
    activeKey,
  );
};

const unstakeToken = (
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
) => {
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'unstake',
    contractPayload: { symbol: symbol, quantity: amount },
  });
  return HiveEngineUtils.sendOperation(
    [
      CustomJsonUtils.getCustomJsonOperation(
        json,
        username,
        KeyType.ACTIVE,
        Config.hiveEngine.mainnet,
      ),
    ],
    activeKey,
  );
};

const delegateToken = (
  to: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
) => {
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'delegate',
    contractPayload: { to: to, symbol: symbol, quantity: amount },
  });
  return HiveEngineUtils.sendOperation(
    [
      CustomJsonUtils.getCustomJsonOperation(
        json,
        username,
        KeyType.ACTIVE,
        Config.hiveEngine.mainnet,
      ),
    ],
    activeKey,
  );
};

const cancelDelegationToken = (
  from: string,
  symbol: string,
  amount: string,
  activeKey: Key,
  username: string,
) => {
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'undelegate',
    contractPayload: { from: from, symbol: symbol, quantity: amount },
  });
  return HiveEngineUtils.sendOperation(
    [
      CustomJsonUtils.getCustomJsonOperation(
        json,
        username,
        KeyType.ACTIVE,
        Config.hiveEngine.mainnet,
      ),
    ],
    activeKey,
  );
};

const getUserBalance = (account: string) => {
  return HiveEngineConfigUtils.getApi().find('tokens', 'balances', {
    account,
  });
};

const getIncomingDelegations = async (
  symbol: string,
  username: string,
): Promise<TokenDelegation[]> => {
  return HiveEngineConfigUtils.getApi().find('tokens', 'delegations', {
    to: username,
    symbol: symbol,
  });
};

const getOutgoingDelegations = async (
  symbol: string,
  username: string,
): Promise<TokenDelegation[]> => {
  return HiveEngineConfigUtils.getApi().find('tokens', 'delegations', {
    from: username,
    symbol: symbol,
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
): Promise<any> => {
  return HiveEngineConfigUtils.getApi().find(
    'tokens',
    'tokens',
    query,
    limit,
    offset,
    indexes,
  );
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
  return HiveEngineConfigUtils.getApi().find(
    'market',
    'metrics',
    query,
    limit,
    offset,
    indexes,
  );
};

const sendToken = (
  currency: string,
  to: string,
  amount: string,
  memo: string,
  activeKey: Key,
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
  return HiveEngineUtils.sendOperation(
    [
      CustomJsonUtils.getCustomJsonOperation(
        json,
        username,
        KeyType.ACTIVE,
        Config.hiveEngine.mainnet,
      ),
    ],
    activeKey,
  );
};

export const getHiveEngineTokenValue = (
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

const TokensUtils = {
  sendToken,
  getUserBalance,
  stakeToken,
  unstakeToken,
  delegateToken,
  cancelDelegationToken,
  getIncomingDelegations,
  getOutgoingDelegations,
  getAllTokens,
  getTokensMarket,
};

export default TokensUtils;

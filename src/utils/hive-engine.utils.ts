import { hsc } from '@api/hiveEngine';
import { PrivateKey } from '@hiveio/dhive';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import Config from 'src/config';
import HiveUtils from 'src/utils/hive.utils';
type SendTokenProps = {
  username: string;
  currency: string;
  to: string;
  amount: string;
  memo: string;
};

const stakeToken = (
  activePrivateKey: string,
  to: string,
  symbol: string,
  amount: string,
  activeAccountName: string,
) => {
  const id = Config.hiveEngine.MAINNET;
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'stake',
    contractPayload: { to: to, symbol: symbol, quantity: amount },
  });
  return HiveUtils.getClient().broadcast.json(
    {
      required_posting_auths: [],
      required_auths: [activeAccountName],
      id,
      json,
    },
    PrivateKey.fromString(activePrivateKey),
  );
};

const unstakeToken = (
  activePrivateKey: string,
  symbol: string,
  amount: string,
  activeAccountName: string,
) => {
  const id = Config.hiveEngine.MAINNET;
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'unstake',
    contractPayload: { symbol: symbol, quantity: amount },
  });
  return HiveUtils.getClient().broadcast.json(
    {
      required_posting_auths: [],
      required_auths: [activeAccountName],
      id,
      json,
    },
    PrivateKey.fromString(activePrivateKey),
  );
};

const delegateToken = (
  activePrivateKey: string,
  to: string,
  symbol: string,
  amount: string,
  activeAccountName: string,
) => {
  const id = Config.hiveEngine.MAINNET;
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'delegate',
    contractPayload: { to: to, symbol: symbol, quantity: amount },
  });
  return HiveUtils.getClient().broadcast.json(
    {
      required_posting_auths: [],
      required_auths: [activeAccountName],
      id,
      json,
    },
    PrivateKey.fromString(activePrivateKey),
  );
};

const cancelDelegationToken = (
  activePrivateKey: string,
  from: string,
  symbol: string,
  amount: string,
  activeAccountName: string,
) => {
  const id = Config.hiveEngine.MAINNET;
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'undelegate',
    contractPayload: { from: from, symbol: symbol, quantity: amount },
  });
  return HiveUtils.getClient().broadcast.json(
    {
      required_posting_auths: [],
      required_auths: [activeAccountName],
      id,
      json,
    },
    PrivateKey.fromString(activePrivateKey),
  );
};

const getUserBalance = (account: string) => {
  return hsc.find('tokens', 'balances', {
    account,
  });
};

const getIncomingDelegations = async (
  symbol: string,
  username: string,
): Promise<TokenDelegation[]> => {
  return hsc.find('tokens', 'delegations', { to: username, symbol: symbol });
};

const getOutgoingDelegations = async (
  symbol: string,
  username: string,
): Promise<TokenDelegation[]> => {
  return hsc.find('tokens', 'delegations', { from: username, symbol: symbol });
};

const sendToken = (data: SendTokenProps, key: PrivateKey) => {
  const id = Config.hiveEngine.MAINNET;
  const json = JSON.stringify({
    contractName: 'tokens',
    contractAction: 'transfer',
    contractPayload: {
      symbol: data.currency,
      to: data.to,
      quantity: data.amount,
      memo: data.memo,
    },
  });
  return HiveUtils.getClient().broadcast.json(
    { required_posting_auths: [], required_auths: [data.username], id, json },
    key,
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

const HiveEngineUtils = {
  sendToken,
  getUserBalance,
  stakeToken,
  unstakeToken,
  delegateToken,
  cancelDelegationToken,
  getIncomingDelegations,
  getOutgoingDelegations,
};

export default HiveEngineUtils;

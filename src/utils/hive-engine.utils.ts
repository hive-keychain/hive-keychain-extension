import { hsc } from '@api/hiveEngine';
import { Client, PrivateKey } from '@hiveio/dhive';
import Config from 'src/config';
type SendTokenProps = {
  username: string;
  currency: string;
  to: string;
  amount: string;
  memo: string;
};

const stackToken = (
  client: Client,
  privateKey: PrivateKey,
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
  return client.broadcast.json(
    {
      required_posting_auths: [],
      required_auths: [activeAccountName],
      id,
      json,
    },
    privateKey,
  );
};

const unstackToken = (
  client: Client,
  privateKey: PrivateKey,
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
  return client.broadcast.json(
    {
      required_posting_auths: [],
      required_auths: [activeAccountName],
      id,
      json,
    },
    privateKey,
  );
};

const delegateToken = (
  client: Client,
  privateKey: PrivateKey,
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
  return client.broadcast.json(
    {
      required_posting_auths: [],
      required_auths: [activeAccountName],
      id,
      json,
    },
    privateKey,
  );
};

const getUserBalance = (account: string) => {
  return hsc.find('tokens', 'balances', {
    account,
  });
};

const sendToken = (client: Client, data: SendTokenProps, key: PrivateKey) => {
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
  return client.broadcast.json(
    { required_posting_auths: [], required_auths: [data.username], id, json },
    key,
  );
};

const HiveEngineUtils = {
  sendToken,
  getUserBalance,
  stackToken,
  unstackToken,
  delegateToken,
};

export default HiveEngineUtils;

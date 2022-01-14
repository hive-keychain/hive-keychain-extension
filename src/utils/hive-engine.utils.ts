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

const HiveEngineUtils = {
  sendToken(client: Client, data: SendTokenProps, key: PrivateKey) {
    const id = Config.mainNet;
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
  },
  getUserBalance(account: string) {
    return hsc.find('tokens', 'balances', {
      account,
    });
  },
};

export default HiveEngineUtils;

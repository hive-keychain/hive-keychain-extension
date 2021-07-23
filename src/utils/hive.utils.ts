import { Client } from '@hiveio/dhive';
import { Rpc } from 'src/interfaces/rpc.interface';

const DEFAULT_RPC = 'https://api.hive.blog';

let client = new Client(DEFAULT_RPC);

const getClient = (): Client => {
  return client;
};
const setRpc = (rpc: Rpc) => {
  client = new Client(rpc.uri === 'DEFAULT' ? DEFAULT_RPC : rpc.uri);
};

const HiveUtils = {
  getClient,
  setRpc,
};

export default HiveUtils;

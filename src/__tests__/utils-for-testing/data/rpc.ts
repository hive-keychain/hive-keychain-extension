import { Rpc } from '@interfaces/rpc.interface';

const defaultRpc: Rpc = { uri: 'https://api.hive.blog/', testnet: false };
const fake: Rpc = { uri: 'https://fake.rpc.io/', testnet: false };
const empty = {} as Rpc;

export default { defaultRpc, fake, empty };

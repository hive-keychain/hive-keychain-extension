import { Rpc } from 'src/interfaces/rpc.interface';

let activeRpc: Rpc | undefined;

const setActiveRpc = (rpc: Rpc): void => {
  activeRpc = rpc;
};

const getActiveRpc = (): Rpc => {
  return activeRpc!;
};

const RPCModule = {
  setActiveRpc,
  getActiveRpc,
};

export default RPCModule;

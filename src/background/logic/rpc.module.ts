import { Rpc } from 'src/interfaces/rpc.interface';

let activeRpc = null;

const setActiveRpc = (rpc: Rpc): void => {
  activeRpc = rpc;
};

const RPCModule = {
  setActiveRpc,
};
export default RPCModule;

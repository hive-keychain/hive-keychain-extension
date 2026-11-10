import { createRpcFetchRequest } from 'src/utils/evm/ether-json-rpc-provider';

describe('Ether JSON-RPC provider', () => {
  it('bounds each RPC request instead of using the five-minute default', () => {
    expect(createRpcFetchRequest('https://rpc.example').timeout).toBe(15_000);
  });
});

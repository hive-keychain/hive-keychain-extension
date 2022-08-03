import { DefaultRpcs } from '@reference-data/default-rpc.list';
import RpcUtils from 'src/utils/rpc.utils';
//TODO talk about this with cedric:
//  - open an issue?
//  - add the checkRpcStatus before adding the new rpc???
//  - question: do you think that checking is reliable enough? some sites changed the status endpoint.
describe.skip('first', () => {
  it('Must show error if new rpc is not OK', async () => {
    DefaultRpcs.forEach(async (rpc) => {
      const isOK = await RpcUtils.checkRpcStatus(rpc.uri);
      //console.log('rpc: ', rpc.uri);
      //console.log('isOK: ', isOK);
    });
  });
});

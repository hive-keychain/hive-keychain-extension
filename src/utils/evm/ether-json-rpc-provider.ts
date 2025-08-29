import {
  ethers,
  FetchRequest,
  JsonRpcApiProviderOptions,
  Networkish,
} from 'ethers';

export class EtherJsonRpcProvider extends ethers.JsonRpcProvider {
  constructor(
    url?: string | FetchRequest,
    network?: Networkish,
    options?: JsonRpcApiProviderOptions,
  ) {
    super(url, network, options);
  }

  async send(method: string, params: any[]): Promise<any> {
    return super.send(method, params).catch((err) => {
      console.log(
        'catch err in custom ether json rpc provider',
        err,
        method,
        params,
      );
      throw { ...err, customMessage: 'Hello troudballe' };
    });
  }
}

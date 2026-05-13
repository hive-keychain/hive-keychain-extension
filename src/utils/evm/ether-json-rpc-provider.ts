import {
  ethers,
  FetchRequest,
  JsonRpcApiProviderOptions,
  Networkish,
} from 'ethers';

export type EtherJsonRpcFailoverContext = {
  network: ethers.Network;
  isSwitchRpcAuto: () => Promise<boolean>;
  getAlternateRpcUrls: (currentUrl: string) => Promise<string[]>;
  onSwitchedToRpcUrl: (newUrl: string) => Promise<void>;
  isInfrastructureFailure: (err: unknown) => boolean;
};

export type EtherJsonRpcProviderFailoverOptions = {
  currentRpcUrl: string;
  failover: EtherJsonRpcFailoverContext;
};

const wrapSendError = (err: unknown) => {
  return { ...(err as object), customMessage: 'Caught error' };
};

export class EtherJsonRpcProvider extends ethers.JsonRpcProvider {
  private readonly currentRpcUrl: string;
  private readonly failover?: EtherJsonRpcFailoverContext;

  constructor(
    url?: string | FetchRequest,
    network?: Networkish,
    options?: JsonRpcApiProviderOptions,
    failoverOptions?: EtherJsonRpcProviderFailoverOptions,
  ) {
    super(url, network, options);
    this.failover = failoverOptions?.failover;
    this.currentRpcUrl =
      failoverOptions?.currentRpcUrl ??
      (typeof url === 'string' ? url : '');
  }

  async send(method: string, params: any[]): Promise<any> {
    try {
      return await super.send(method, params);
    } catch (err) {
      const failover = this.failover;
      if (!failover) {
        throw wrapSendError(err);
      }
      const autoSwitch = await failover.isSwitchRpcAuto();
      if (!autoSwitch || !failover.isInfrastructureFailure(err)) {
        throw wrapSendError(err);
      }
      const otherUrls = await failover.getAlternateRpcUrls(
        this.currentRpcUrl,
      );
      for (const rpcUrl of otherUrls) {
        if (!rpcUrl || rpcUrl === this.currentRpcUrl) {
          continue;
        }
        const fallback = new ethers.JsonRpcProvider(rpcUrl, undefined, {
          staticNetwork: failover.network,
        });
        try {
          const result = await fallback.send(method, params);
          await failover.onSwitchedToRpcUrl(rpcUrl);
          return result;
        } catch {
          // try next RPC
        } finally {
          try {
            fallback.destroy();
          } catch {
            // ignore
          }
        }
      }
      throw wrapSendError(err);
    }
  }
}

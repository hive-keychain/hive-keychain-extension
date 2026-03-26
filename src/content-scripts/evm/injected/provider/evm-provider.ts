import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  EIP6963ProviderInfo,
  EvmEventName,
  RequestArguments,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
import EventEmitter from 'events';
import { validateRequest } from 'src/content-scripts/evm/evm-request-validation';
import { providerIcon } from 'src/content-scripts/evm/injected/provider/provider-icon';
import Logger from 'src/utils/logger.utils';

const ProviderInfo: EIP6963ProviderInfo = {
  uuid: '03e583ef-0285-4bd0-afaf-7032f5f61b3a',
  name: 'Hive Keychain',
  icon: providerIcon,
  rdns: 'com.hive-keychain',
};

let evmProvider: EvmProvider;

export class EvmProvider extends EventEmitter {
  chainId: string | undefined;
  isMetaMask: boolean = false;
  private _accounts: string[] = [];
  private _current_id = 1;
  private _requests = {} as { [id: number]: any };

  _isConnected = true;
  _initialized = true;
  _isUnlocked = true;
  _dappForcedChain = false;

  constructor() {
    super();
    this.init();
    // this._state.initialized = true;
  }

  init = async () => {
    await this.initListener();
    await this.initiateProviderInformation();
    this._initialized = true;
    this.emit('_initialized');
  };

  initiateProviderInformation = async () => {
    const [chainId, accounts] = (await Promise.all([
      this.processRequest({
        method: EvmRequestMethod.GET_CHAIN,
        params: [],
      }),
      this.processRequest({
        method: EvmRequestMethod.GET_ACCOUNTS,
        params: [],
      }),
    ])) as [string, string[]];
    this.updateAccounts(accounts);
    this.chainId = chainId;
    // this.emit('accountsChanged', []);
  };

  private normalizeAccounts = (accounts: unknown): string[] => {
    if (!Array.isArray(accounts)) return [];

    return accounts
      .filter((account): account is string => typeof account === 'string')
      .map((account) => account.toLowerCase());
  };

  private updateAccounts = (accounts: unknown): string[] => {
    const normalizedAccounts = this.normalizeAccounts(accounts);
    this._accounts = normalizedAccounts;
    return normalizedAccounts;
  };

  isConnected = () => {
    return true;
  };

  initListener = () => {
    window.addEventListener(
      'message',
      (event) => {
        // We only accept messages from ourselves
        if (event.source != window) return;
        if (event.data.type && event.data.type == 'evm_keychain_response') {
          const result = event.data.response.result;
          const requestId =
            event.data.response.requestId ?? event.data.response.request_id;
          if (
            result !== null &&
            requestId !== null &&
            requestId !== undefined
          ) {
            if (this._requests[requestId]) {
              this._requests[requestId]({ result: result });
              delete this._requests[requestId];
            }
          }
        } else if (event.data.type && event.data.type == 'evm_keychain_error') {
          const error = event.data.response.error;
          const requestId =
            event.data.response.requestId ?? event.data.response.request_id;
          if (error && requestId !== null && requestId !== undefined) {
            if (this._requests[requestId]) {
              this._requests[requestId]({ error });
              delete this._requests[requestId];
            }
          }
        } else if (event.data.type && event.data.type == 'evm_keychain_event') {
          const eventData = event.data;
          const routedEvent = eventData.event as RoutedEvmEvent;
          if (
            routedEvent.scope?.kind === 'domain' &&
            routedEvent.scope.domain !== window.location.hostname
          ) {
            return;
          }
          switch (eventData.event.eventType) {
            case EvmEventName.CHAIN_CHANGED: {
              if (this._dappForcedChain) {
                Logger.info('Skip change of chain');
                return;
              }
              evmProvider.chainId = eventData.event.args;
              break;
            }
            case EvmEventName.ACCOUNT_CHANGED: {
              const normalizedAccounts = this.normalizeAccounts(
                eventData.event.args,
              );
              if (
                JSON.stringify(normalizedAccounts) ===
                JSON.stringify(this._accounts)
              )
                return;
              else this._accounts = normalizedAccounts;
              eventData.event.args = normalizedAccounts;
              break;
            }
            case EvmEventName.GET_CHAIN_FROM_PROVIDER: {
              this.dispatchCustomEvent(
                EvmEventName.SEND_BACK_CHAIN_TO_BACKGROUND,
                { chainId: this._dappForcedChain ? this.chainId : null },
                () => {},
              );
              return;
            }
          }
          this.emit(eventData.event.eventType, eventData.event.args);
        }
      },
      false,
    );
  };

  async request(args: RequestArguments): Promise<any> {
    try {
      validateRequest(args.method, args.params);
      switch (args.method) {
        case EvmRequestMethod.GET_ACCOUNTS: {
          return this.updateAccounts(await this.processRequest(args));
        }
        case EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
          if (args.params && (args.params as any[])[0].chainId) {
            this._dappForcedChain = true;
            this.chainId = (args.params as any[])[0].chainId;
            this.emit('chainChanged', this.chainId);
          }
          return this.chainId;
        }
      }

      const result = await this.processRequest(args);
      if (args.method === EvmRequestMethod.REQUEST_ACCOUNTS) {
        return this.updateAccounts(result);
      }
      console.log(result, 'result', args, 'args');
      return result;
    } catch (err) {
      throw err;
    }
  }

  processRequest = async (args: RequestArguments) => {
    return new Promise((resolve, reject) => {
      this.dispatchCustomEvent(
        EvmEventName.REQUEST,
        { ...args, chainId: this.chainId },
        (response: any) => {
          if (response.result !== null && response.result !== undefined) {
            resolve(response.result);
          } else {
            reject(response.error);
          }
        },
      );
    });
  };

  dispatchCustomEvent = (name: string, data: any, callback: Function) => {
    this._requests[this._current_id] = callback;
    data = Object.assign(
      {
        request_id: this._current_id,
      },
      data,
    );
    document.dispatchEvent(
      new CustomEvent(name, {
        detail: data,
      }),
    );
    this._current_id++;
  };
}

const handler = {};

const getProvider = () => {
  if (!evmProvider) evmProvider = new Proxy(new EvmProvider(), handler);
  return evmProvider;
};

export const EvmProviderModule = {
  getProvider,
  ProviderInfo,
};

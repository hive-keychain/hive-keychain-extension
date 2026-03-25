import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  EIP6963ProviderInfo,
  EvmEventName,
  RoutedEvmEvent,
  RequestArguments,
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
    const chainId = (await this.processRequest({
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
    })) as string;
    // const accounts = (await this.processRequest({
    //   method: EvmRequestMethod.GET_ACCOUNTS,
    //   params: [],
    // })) as string[];
    // this._accounts = accounts;
    this.chainId = chainId;
    // this.emit('accountsChanged', []);
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
          const requestId = event.data.response.requestId;
          if (result !== null && requestId !== null) {
            if (this._requests[requestId]) {
              this._requests[requestId]({ result: result });
              delete this._requests[requestId];
            }
          }
        } else if (event.data.type && event.data.type == 'evm_keychain_error') {
          const error = event.data.response.error;
          const requestId = event.data.response.requestId;
          if (error && requestId) {
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
              if (
                JSON.stringify(eventData.event.args) ===
                JSON.stringify(this._accounts)
              )
                return;
              else
                this._accounts = eventData.event.args.map((acc: string) =>
                  acc.toLowerCase(),
                );
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
          return this._accounts;
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

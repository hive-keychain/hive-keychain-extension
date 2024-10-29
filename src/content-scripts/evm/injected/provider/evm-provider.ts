import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  EIP6963ProviderInfo,
  EvmEventName,
  RequestArguments,
} from '@interfaces/evm-provider.interface';
import EventEmitter from 'events';
import { validateRequest } from 'src/content-scripts/evm/evm-request-validation';

const ProviderInfo: EIP6963ProviderInfo = {
  uuid: '03e583ef-0285-4bd0-afaf-7032f5f61b3a',
  name: 'Hive Keychain',
  icon: 'data:image/png;base64,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',
  rdns: 'https://hive-keychain.com/',
};

let evmProvider: EvmProvider;

export class EvmProvider extends EventEmitter {
  chainId: string | undefined;
  isMetaMask: boolean = true;
  private _accounts: string[] = [];
  private _current_id = 1;
  private _requests = {} as { [id: number]: any };

  _isConnected = true;
  _initialized = true;
  _isUnlocked = true;

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
    // const chainId = await this.processRequest({
    //   method: EvmRequestMethod.GET_CHAIN,
    //   params: [],
    // });
    // console.log(chainId);
    // const accounts = await this.processRequest({
    //   method: EvmRequestMethod.GET_ACCOUNTS,
    //   params: [],
    // });
    // console.log(accounts);
    // this._accounts = accounts;
    // this.chainId = chainId;
    // console.log('accountsChanged', this._accounts);
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
          if (result && requestId) {
            if (this._requests[requestId]) {
              this._requests[requestId]({ result });
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
          switch (eventData.event.eventType) {
            case EvmEventName.CHAIN_CHANGED: {
              evmProvider.chainId = eventData.event.args;
              break;
            }
            case EvmEventName.ACCOUNT_CHANGED: {
              console.log('received event');
              console.log(
                JSON.stringify(eventData.event.args) ===
                  JSON.stringify(this._accounts),
                JSON.stringify(eventData.event.args),
                JSON.stringify(this._accounts),
              );

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
      }

      const result = await this.processRequest(args);
      console.log({ providerResult: result, request: args.method });
      return result;
    } catch (err) {
      console.log(err);
      throw err;
      // return err;
    }
  }

  processRequest = async (args: RequestArguments) => {
    return new Promise((resolve, reject) => {
      this.dispatchCustomEvent('requestEvm', args, (response: any) => {
        if (response.result) {
          resolve(response.result);
        } else {
          reject(response.error);
        }
      });
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

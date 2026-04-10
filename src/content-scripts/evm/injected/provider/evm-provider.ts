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
import { getWindowOrigin } from 'src/utils/browser-origin.utils';
import {
  areEvmAccountsEqual,
  areEvmChainIdsEqual,
  normalizeEvmAccounts,
  normalizeEvmChainId,
} from 'src/utils/evm-provider-value.utils';

const ProviderInfo: EIP6963ProviderInfo = {
  uuid: '03e583ef-0285-4bd0-afaf-7032f5f61b3a',
  name: 'Hive Keychain',
  icon: providerIcon,
  rdns: 'com.hive-keychain',
};

let evmProvider: EvmProvider;

export class EvmProvider extends EventEmitter {
  chainId: string | undefined;
  // Many dapps gate provider initialization and event subscriptions behind
  // the legacy MetaMask compatibility flag.
  isMetaMask: boolean = true;
  autoRefreshOnNetworkChange = false;
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
    this.applyChainId(chainId, { emit: true });
    this.applyAccounts(accounts, { emit: true });
  };

  private applyChainId = (
    chainId: unknown,
    options: { emit?: boolean } = {},
  ): string | undefined => {
    const nextChainId = normalizeEvmChainId(chainId);
    if (!nextChainId) return this.chainId;

    const shouldEmit = options.emit && !areEvmChainIdsEqual(this.chainId, nextChainId);
    this.chainId = nextChainId;

    if (shouldEmit) {
      this.emit(EvmEventName.CHAIN_CHANGED, nextChainId);
      this.emit('networkChanged', `${parseInt(nextChainId, 16)}`);
    }

    return this.chainId;
  };

  private applyAccounts = (
    accounts: unknown,
    options: { emit?: boolean } = {},
  ): string[] => {
    const normalizedAccounts = normalizeEvmAccounts(accounts);
    const shouldEmit =
      options.emit && !areEvmAccountsEqual(this._accounts, normalizedAccounts);

    this._accounts = normalizedAccounts;

    if (shouldEmit) {
      this.emit(EvmEventName.ACCOUNT_CHANGED, normalizedAccounts);
    }

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
          if (requestId !== null && requestId !== undefined) {
            if (this._requests[requestId]) {
              this._requests[requestId]({
                hasResult: Object.prototype.hasOwnProperty.call(
                  event.data.response,
                  'result',
                ),
                result,
              });
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
            routedEvent.scope?.kind === 'origin' &&
            routedEvent.scope.origin !== getWindowOrigin()
          ) {
            return;
          }
          switch (eventData.event.eventType) {
            case EvmEventName.CHAIN_CHANGED: {
              this.applyChainId(eventData.event.args, { emit: true });
              return;
            }
            case EvmEventName.ACCOUNT_CHANGED: {
              this.applyAccounts(eventData.event.args, { emit: true });
              return;
            }
            case EvmEventName.GET_CHAIN_FROM_PROVIDER: {
              this.dispatchCustomEvent(
                EvmEventName.SEND_BACK_CHAIN_TO_BACKGROUND,
                { chainId: this.chainId ?? null },
                () => {},
              );
              return;
            }
          }
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
          return this.applyAccounts(await this.processRequest(args));
        }
        case EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
          return this.processRequest(args);
        }
      }

      const result = await this.processRequest(args);
      if (args.method === EvmRequestMethod.REQUEST_ACCOUNTS) {
        return normalizeEvmAccounts(result);
      }
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
          if (response?.hasResult) {
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

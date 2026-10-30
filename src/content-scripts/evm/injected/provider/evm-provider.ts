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

type LegacyRpcPayload = {
  id?: string | number | null;
  jsonrpc?: string;
  method: string;
  params?: unknown[] | object;
};

type LegacyRpcCallback = (error: unknown, response?: unknown) => void;

const toDecimalChainId = (chainId: string) => {
  const decimalChainId = parseInt(chainId, 16);
  if (Number.isNaN(decimalChainId)) return null;
  return `${decimalChainId}`;
};

const toLegacyRpcResponse = (payload: LegacyRpcPayload, result: unknown) => ({
  id: payload.id,
  jsonrpc: payload.jsonrpc ?? '2.0',
  result,
});

const toLegacyRpcError = (payload: LegacyRpcPayload, error: unknown) => ({
  id: payload.id,
  jsonrpc: payload.jsonrpc ?? '2.0',
  error,
});

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

  private hasEmittedConnect = false;

  get selectedAddress(): string | null {
    return this._accounts[0] ?? null;
  }

  get networkVersion(): string | null {
    if (!this.chainId) return null;
    return toDecimalChainId(this.chainId);
  }

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
    this.dispatchCustomEvent(
      EvmEventName.INITIALIZE_PROVIDER_REQUEST,
      {},
      () => {},
    );
  };

  private applyChainId = (
    chainId: unknown,
    options: { emit?: boolean } = {},
  ): string | undefined => {
    const nextChainId = normalizeEvmChainId(chainId);
    if (!nextChainId) return this.chainId;

    const shouldEmit =
      options.emit && !areEvmChainIdsEqual(this.chainId, nextChainId);
    this.chainId = nextChainId;
    this.emitConnect(nextChainId);

    if (shouldEmit) {
      this.emit(EvmEventName.CHAIN_CHANGED, nextChainId);
      const networkVersion = toDecimalChainId(nextChainId);
      if (networkVersion) {
        this.emit('networkChanged', networkVersion);
      }
    }

    return this.chainId;
  };

  private emitConnect = (chainId: string) => {
    if (this.hasEmittedConnect) return;
    this.hasEmittedConnect = true;
    this.emit('connect', { chainId });
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
            case EvmEventName.INITIALIZE_PROVIDER_RESPONSE: {
              this.applyChainId(eventData.event.args.chainId, { emit: true });
              this.applyAccounts(eventData.event.args.accounts, { emit: true });
              return;
            }
          }
        }
      },
      false,
    );
  };

  enable = () => {
    return this.request({ method: EvmRequestMethod.REQUEST_ACCOUNTS });
  };

  sendAsync = (
    payload: LegacyRpcPayload | LegacyRpcPayload[],
    callback: LegacyRpcCallback,
  ) => {
    if (typeof callback !== 'function') return;

    if (Array.isArray(payload)) {
      Promise.all(
        payload.map(async (item) => {
          try {
            return toLegacyRpcResponse(
              item,
              await this.requestFromPayload(item),
            );
          } catch (error) {
            return toLegacyRpcError(item, error);
          }
        }),
      ).then((responses) => callback(null, responses));
      return;
    }

    this.requestFromPayload(payload)
      .then((result) => callback(null, toLegacyRpcResponse(payload, result)))
      .catch((error) => callback(error, toLegacyRpcError(payload, error)));
  };

  send = (
    methodOrPayload: string | LegacyRpcPayload | LegacyRpcPayload[],
    paramsOrCallback?: unknown[] | LegacyRpcCallback,
  ): Promise<unknown> | void => {
    if (typeof methodOrPayload === 'string') {
      return this.request({
        method: methodOrPayload as EvmRequestMethod,
        params: Array.isArray(paramsOrCallback) ? paramsOrCallback : undefined,
      });
    }

    if (typeof paramsOrCallback === 'function') {
      this.sendAsync(methodOrPayload, paramsOrCallback);
      return;
    }

    if (Array.isArray(methodOrPayload)) {
      return Promise.all(
        methodOrPayload.map((payload) => this.requestFromPayload(payload)),
      );
    }

    return this.requestFromPayload(methodOrPayload);
  };

  private requestFromPayload = (payload: LegacyRpcPayload) => {
    return this.request({
      method: payload.method as EvmRequestMethod,
      params: payload.params,
    });
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
        return this.applyAccounts(result, { emit: true });
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

import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import {
  EIP6963ProviderInfo,
  EvmEventName,
  ProviderRpcErrorItem,
  ProviderRpcErrorList,
  RequestArguments,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
import EventEmitter from 'events';
import { validateRequest } from 'src/content-scripts/evm/evm-request-validation';
import { providerIcon } from 'src/content-scripts/evm/injected/provider/provider-icon';

const ProviderInfo: EIP6963ProviderInfo = {
  uuid: '03e583ef-0285-4bd0-afaf-7032f5f61b3a',
  name: 'Hive Keychain',
  icon: providerIcon,
  rdns: 'com.hive-keychain',
};

let evmProvider: EvmProvider;

export class EvmProvider extends EventEmitter {
  chainId: string | undefined;
  isMetaMask: boolean = true;
  private _accounts: string[] = [];
  private _current_id = 1;
  private _requests = {} as { [id: number]: any };

  _isConnected = false;
  _initialized = false;
  _isUnlocked = true;

  constructor() {
    super();
    void this.init();
  }

  init = async () => {
    await this.initListener();
    let hydrated = false;

    try {
      await this.initiateProviderInformation();
      hydrated = true;
    } catch (error) {
      if (this.isDisconnectedError(error)) {
        this.setDisconnected(error);
      }
    } finally {
      this._initialized = true;
      this.emit(EvmEventName.INITIALIZED);
      if (hydrated) {
        this.setConnected(this.chainId);
      }
    }
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
    console.log('chainId', chainId);
    console.log('accounts', accounts);
    this.updateAccounts(accounts);
    this.chainId = chainId;
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

  private isProviderRpcErrorItem = (
    error: unknown,
  ): error is ProviderRpcErrorItem => {
    return (
      !!error &&
      typeof error === 'object' &&
      typeof (error as ProviderRpcErrorItem).code === 'number' &&
      typeof (error as ProviderRpcErrorItem).message === 'string'
    );
  };

  private isDisconnectedError = (error: unknown) => {
    return (
      this.isProviderRpcErrorItem(error) &&
      error.code === ProviderRpcErrorList.disconnected.code
    );
  };

  private setConnected = (chainId = this.chainId) => {
    if (!chainId || this._isConnected) {
      return;
    }

    this._isConnected = true;
    this.emit('connect', { chainId });
  };

  private setDisconnected = (error?: unknown) => {
    if (!this._isConnected) {
      return;
    }

    this._isConnected = false;
    this.emit(
      'disconnect',
      this.isProviderRpcErrorItem(error)
        ? { code: error.code, message: error.message }
        : { ...ProviderRpcErrorList.disconnected },
    );
  };

  isConnected = () => {
    return this._isConnected;
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
              this._requests[requestId]({ result: result });
              delete this._requests[requestId];
            }
          }
        } else if (event.data.type && event.data.type == 'evm_keychain_error') {
          const error = event.data.response.error;
          const requestId =
            event.data.response.requestId ?? event.data.response.request_id;
          if (error && requestId !== null && requestId !== undefined) {
            if (this.isDisconnectedError(error)) {
              this.setDisconnected(error);
            }
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
            routedEvent.scope.domain !== window.location.origin
          ) {
            return;
          }
          switch (eventData.event.eventType) {
            case EvmEventName.CHAIN_CHANGED: {
              if (this.chainId === eventData.event.args) {
                return;
              }
              this.chainId = eventData.event.args;
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
                { chainId: this.chainId ?? null },
                () => {},
              );
              return;
            }
          }
          if (this._initialized) {
            this.setConnected(this.chainId);
          }
          this.emit(eventData.event.eventType, eventData.event.args);
        }
      },
      false,
    );
  };

  async request(args: RequestArguments): Promise<any> {
    try {
      console.log('request', args);
      validateRequest(args.method, args.params);
      switch (args.method) {
        case EvmRequestMethod.GET_CHAIN: {
          console.log('GET_CHAIN');
          const chainId = (await this.processRequest(args)) as string;
          console.log('chainId', chainId);
          this.chainId = chainId;
          if (this._initialized) {
            this.setConnected(chainId);
          }
          return chainId;
        }
        case EvmRequestMethod.GET_ACCOUNTS: {
          const accounts = this.updateAccounts(await this.processRequest(args));
          if (this._initialized) {
            this.setConnected(this.chainId);
          }
          return accounts;
        }
      }

      const result = await this.processRequest(args);
      if (args.method === EvmRequestMethod.REQUEST_ACCOUNTS) {
        const accounts = this.updateAccounts(result);
        if (this._initialized) {
          this.setConnected(this.chainId);
        }
        return accounts;
      }
      if (this._initialized) {
        this.setConnected(this.chainId);
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
          if (response.error !== null && response.error !== undefined) {
            reject(response.error);
          } else {
            resolve(response.result);
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

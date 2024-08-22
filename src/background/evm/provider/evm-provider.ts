import {
  EIP6963ProviderInfo,
  RequestArguments,
} from '@background/evm/provider/provider.interface';
import EventEmitter from 'events';

const ProviderInfo: EIP6963ProviderInfo = {
  uuid: '1fa914a1-f8c9-4c74-8d84-4aa93dc90eec',
  name: 'Clear Wallet',
  icon: 'data:image/png;base64,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',
  rdns: 'clear-wallet.flashsoft.eu/',
};

let current_id = 1;
let requests = {} as { [id: number]: any };
let handshake_callback = null;

export class EvmProvider extends EventEmitter {
  constructor() {
    super();
  }

  async request(args: RequestArguments): Promise<any> {
    return processRequest(args);
  }
}

const processRequest = async (args: RequestArguments) => {
  return new Promise((resolve, reject) => {
    dispatchCustomEvent('requestEvm', args, (result: any) => {
      resolve(result);
    });
  });
};

const dispatchCustomEvent = (name: string, data: any, callback: Function) => {
  requests[current_id] = callback;
  data = Object.assign(
    {
      request_id: current_id,
    },
    data,
  );
  document.dispatchEvent(
    new CustomEvent(name, {
      detail: data,
    }),
  );
  current_id++;
};

window.addEventListener(
  'message',
  function (event) {
    // We only accept messages from ourselves
    if (event.source != window) return;

    if (event.data.type && event.data.type == 'evm_keychain_response') {
      const result = event.data.response.result;
      const requestId = event.data.response.requestId;
      if (result && requestId) {
        if (requests[requestId]) {
          requests[requestId](result);
          delete requests[requestId];
        }
      }
    }
    //   else if (
    //   event.data.type &&
    //   event.data.type == 'hive_keychain_handshake'
    // ) {
    //   if (hive_keychain.handshake_callback) {
    //     hive_keychain.handshake_callback();
    //     }
    //   }
  },
  false,
);

const getProvider = () => {
  return new EvmProvider();
};

export const EvmProviderModule = {
  getProvider,
  ProviderInfo,
};

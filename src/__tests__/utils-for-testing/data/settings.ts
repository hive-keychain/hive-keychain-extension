import { AutoLockType } from '@interfaces/autolock.interface';
import { Settings } from '@interfaces/settings.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';

export default {
  all: {
    autolock: AutoLockType.DEVICE_LOCK,
    claimAccounts: {
      'keychain.tests': false,
    },
    claimRewards: {
      'keychain.tests': false,
    },
    current_rpc: {
      testnet: false,
      uri: 'https://api.hive.blog/',
    },
    keychainify_enabled: true,
    no_confirm: {
      'keychain.tests': {
        'splinterlands.com': {
          signBuffer: true,
          signTx: true,
        },
      },
    },
    rpc: DefaultRpcs,
    switchRpcAuto: false,
    transfer_to: {
      'keychain.tests': ['orinoco', 'jobaboard'],
    },
  } as Settings,
};

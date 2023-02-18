import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import {
  KeychainRequest,
  KeychainRequestWrapper,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import * as Init from 'src/background/requests/init';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

export type RequestDataMocks = {
  tab?: number;
  request?: KeychainRequest;
  request_id?: number;
  confirmed: boolean;
  accounts?: LocalAccount[];
  rpc?: Rpc | null;
  preferences?: NoConfirm;
  key?: string;
  publicKey?: string;
  windowId?: number;
};

const requestData = {
  rpc: DefaultRpcs[0],
} as RequestDataMocks;

const hiveEngineConfigByDefault = {
  rpc: 'https://api.hive-engine.com/rpc',
  mainnet: 'ssc-mainnet-hive',
  accountHistoryApi: 'https://history.hive-engine.com/',
} as HiveEngineConfig;

const constants = {
  requestData,
  hiveEngineConfigByDefault,
  resetData: {
    confirmed: false,
    windowId: undefined,
  },
  LSKEnum: LocalStorageKeyEnum.__REQUEST_HANDLER,
  keys: {
    key: userData.one.nonEncryptKeys.posting,
    publicKey: userData.one.encryptKeys.posting,
  },
  sender: { tab: { id: 1 } } as chrome.runtime.MessageSender,
  msg: {
    domain: 'domain',
    request: keychainRequest.noValues.decode,
  } as KeychainRequestWrapper,
};

const spies = {
  getValueFromLocalStorage: (data: RequestDataMocks | undefined | null) =>
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(data),
  getClient: () => {},
  removeWindow: jest.spyOn(DialogLifeCycle, 'removeWindow'),
  removeFromLocalStorage: jest
    .spyOn(LocalStorageUtils, 'removeFromLocalStorage')
    .mockResolvedValue(undefined),
  saveValueInLocalStorage: jest
    .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
    .mockReturnValue(undefined),
  init: jest.spyOn(Init, 'default').mockResolvedValue(undefined),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

const indexMocks = {
  spies,
  constants,
  methods,
};

export default indexMocks;

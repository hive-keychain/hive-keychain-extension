import { BgdHiveEngineConfigModule } from '@background/hive-engine-config.module';
import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import * as PerformOperation from '@background/requests/operations';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestTypes,
  RequestDecode,
  RequestId,
  RequestPost,
} from '@interfaces/keychain.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import RpcUtils from 'src/utils/rpc.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  username: mk.user.one,
  rpc: DefaultRpcs[0].uri,
  domain: 'domain',
  type: KeychainRequestTypes.addAccount,
  request_id: 1,
} as KeychainRequest;

const decodeData = {
  type: KeychainRequestTypes.decode,
  username: mk.user.one,
  message: '',
  method: KeychainKeyTypes.memo,
  rpc: DefaultRpcs[0].uri,
  domain: 'domain',
  request_id: 1,
} as RequestDecode & RequestId;

const postData = {
  type: KeychainRequestTypes.post,
  username: mk.user.one,
  body: "{'body': 'the body'}",
  parent_perm: 'https://saturnoman.com',
  json_metadata: "{'body':'the body'}",
  permlink: 'https://hive.blog/perma-1',
  comment_options: '',
  rpc: DefaultRpcs[0].uri,
  domain: 'domain',
  request_id: 1,
} as RequestPost & RequestId;

const _accounts = {
  encrypt: {
    msg: '0000009b000000770000005700000029000000ae0000008d000000ae00000046WHrXFxuZRaj4uDwLXR8vFw+tW0M7fUZqAfRqnqga+fvyVCNAEnutR76JDJ+Hi6zfX2bMEkzk2c/fnL2FZb9e+ZNoklar2xYnxvM3tXjkh8Qj0roAbwXfWt+DzjqMfeTvuzHzbgnCzir7r5v6NgDug0pBplvNAsk83kj5Kd3gBmJfhRieDf8VRk18bZ8DUmhGqu0U0EmFn9KqSE6HxOKo/sZFRu0In8090s/05IHro9OLCZQ3vEy6A0GPyzoc5PyL/a7qgNiERpK37e3h3LXZBG9HkmDh0HimY2GoQzBYr7sOKFrrmfZlT7rtIuXWfa0nhQSM1pI9Y1s9Y2GWkoiUlweNRuTuAwFAi+SuEHRHBtmokqkgChUUT4bNs0fGbszm3NuB3rqiCXj27kcVWw/aqglb0qJGT77cv2gqhqSKu3BJkw7KNwkjFRYow/5ScHvh6RP1hUPEpEavIiuYZEi0cMu7cmROyZYbc8XLDry8Jpc=',
    mkUsed: mk.user.one,
    differentName: {
      msg: '0000005900000096000000c500000028000000cb000000ce00000020000000afoZAc9WPwIS3MsSe/vHGK/GhcAc9cf9s+8wsrGNKgC3dVkA1T6WpMZeUFkoBp1xwWExHtkBqplucrygjHr/uhGjjDQfE7+458c3YyNNBi0FedgUPwAUA9lmgG0n97Iji+',
      mkUsed: mk.user.one,
    },
  },
};

const hiveEngineConfigByDefault = {
  rpc: 'https://api.hive-engine.com/rpc',
  mainnet: 'ssc-mainnet-hive',
  accountHistoryApi: 'https://history.hive-engine.com/',
} as HiveEngineConfig;

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
  getMk: (mk: string) => (MkModule.getMk = jest.fn().mockResolvedValue(mk)),
  findRpc: (rpc: Rpc) => (RpcUtils.findRpc = jest.fn().mockResolvedValue(rpc)),
  getMultipleValueFromLocalStorage: (items: {
    accounts: string;
    current_rpc: Rpc;
    no_confirm: NoConfirm;
  }) =>
    (LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(items)),
  getActiveConfig: (config: HiveEngineConfig) =>
    (BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(config)),
  performOperation: jest
    .spyOn(PerformOperation, 'performOperation')
    .mockResolvedValue(undefined),
};

const spies = {
  logger: {
    info: jest.spyOn(Logger, 'info'),
  },
  requestHandler: {
    saveInLocalStorage: jest.spyOn(requestHandler, 'saveInLocalStorage'),
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
    mocks.performOperation;
  }),
  mocking: (mk: string, accounts: string, noConfirm?: NoConfirm) => {
    mocks.getMk(mk);
    mocks.getMultipleValueFromLocalStorage({
      accounts: accounts,
      current_rpc: DefaultRpcs[0],
      no_confirm: noConfirm ?? {},
    });
    mocks.findRpc(DefaultRpcs[0]);
    mocks.getActiveConfig(hiveEngineConfigByDefault);
  },
};

const constants = {
  data,
  requestHandler,
  _accounts,
  hiveEngineConfigByDefault,
  decodeData,
  postData,
};

export default {
  methods,
  constants,
  mocks,
  spies,
};

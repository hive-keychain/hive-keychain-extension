import { BgdHiveEngineConfigModule } from '@background/hive-engine-config.module';
import MkModule from '@background/mk.module';
import init from '@background/requests/init';
import RpcUtils from '@hiveapp/utils/rpc.utils';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import {
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import * as LogicAddAccountRequest from 'src/background/requests/logic/addAccountRequest.logic';
import * as LogicAddAccountToEmptyWallet from 'src/background/requests/logic/addAccountToEmptyWallet.logic';
import * as LogicAnonymousRequests from 'src/background/requests/logic/anonymousRequests.logic';
import * as LogicInitializeWallet from 'src/background/requests/logic/initializeWallet.logic';
import * as LogicMissingKey from 'src/background/requests/logic/missingKey.logic';
import * as LogicMissingUser from 'src/background/requests/logic/missingUser.logic';
import * as LogicRequestWithConfirmation from 'src/background/requests/logic/requestWithConfirmation.logic';
import * as LogicRequestWithoutConfirmation from 'src/background/requests/logic/requestWithoutConfirmation.logic';
import * as LogicTransferRequest from 'src/background/requests/logic/transferRequest.logic';
import * as LogicUnlockWallet from 'src/background/requests/logic/unlockWallet.logic';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { anonymous_requests } from 'src/utils/requests.utils';

describe('init tests:\n', () => {
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

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must call Logger', async () => {
    const cloneKeychainRequestData = objects.clone(
      keychainRequest.data,
    ) as KeychainRequest;
    const sLoggerInfo = jest.spyOn(Logger, 'info');
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.msg,
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);

    await init(
      cloneKeychainRequestData,
      0,
      cloneKeychainRequestData.domain,
      keychainRequest.requestHandler,
    );
    expect(sLoggerInfo).toBeCalledWith('Initializing request logic');
  });

  it('Must call initializeWallet & saveInLocalStorage', async () => {
    const cloneKeychainRequestData = objects.clone(
      keychainRequest.data,
    ) as KeychainRequest;
    cloneKeychainRequestData.type = KeychainRequestTypes.transfer;
    const sInitializeWallet = jest.spyOn(
      LogicInitializeWallet,
      'initializeWallet',
    );
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: '',
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    await init(
      cloneKeychainRequestData,
      0,
      cloneKeychainRequestData.domain,
      keychainRequest.requestHandler,
    );
    expect(sInitializeWallet).toHaveBeenCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestData,
    );
  });

  it('Must call addAccountToEmptyWallet', async () => {
    const cloneKeychainRequestData = objects.clone(
      keychainRequest.data,
    ) as KeychainRequest;
    cloneKeychainRequestData.type = KeychainRequestTypes.addAccount;
    const sAddAccountToEmptyWallet = jest.spyOn(
      LogicAddAccountToEmptyWallet,
      'addAccountToEmptyWallet',
    );
    MkModule.getMk = jest.fn().mockResolvedValue('');
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: '',
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    await init(
      cloneKeychainRequestData,
      0,
      cloneKeychainRequestData.domain,
      keychainRequest.requestHandler,
    );
    expect(sAddAccountToEmptyWallet).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestData,
      cloneKeychainRequestData.domain,
    );
  });

  it('Must call unlockWallet', async () => {
    const cloneKeychainRequestData = objects.clone(
      keychainRequest.data,
    ) as KeychainRequest;
    cloneKeychainRequestData.type = KeychainRequestTypes.transfer;
    const sUnlockWallet = jest.spyOn(LogicUnlockWallet, 'unlockWallet');
    MkModule.getMk = jest.fn().mockResolvedValue('');
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.msg,
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    await init(
      cloneKeychainRequestData,
      0,
      cloneKeychainRequestData.domain,
      keychainRequest.requestHandler,
    );
    expect(sUnlockWallet).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestData,
      cloneKeychainRequestData.domain,
    );
  });

  it('Must call addAccountRequest', async () => {
    const cloneKeychainRequestData = objects.clone(
      keychainRequest.data,
    ) as KeychainRequest;
    cloneKeychainRequestData.type = KeychainRequestTypes.addAccount;
    const sAddAccountRequest = jest.spyOn(
      LogicAddAccountRequest,
      'addAccountRequest',
    );
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.msg,
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    await init(
      cloneKeychainRequestData,
      0,
      cloneKeychainRequestData.domain,
      keychainRequest.requestHandler,
    );
    expect(sAddAccountRequest).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestData,
      cloneKeychainRequestData.domain,
      accounts.local.justTwoKeys,
    );
  });

  it('Must call transferRequest', async () => {
    const cloneKeychainRequestData = objects.clone(
      keychainRequest.data,
    ) as KeychainRequest;
    cloneKeychainRequestData.type = KeychainRequestTypes.transfer;
    const sTransferRequest = jest.spyOn(
      LogicTransferRequest,
      'transferRequest',
    );
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.msg,
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    await init(
      cloneKeychainRequestData,
      0,
      cloneKeychainRequestData.domain,
      keychainRequest.requestHandler,
    );
    expect(sTransferRequest).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestData,
      cloneKeychainRequestData.domain,
      [accounts.local.justTwoKeys],
      DefaultRpcs[0],
      accounts.local.justTwoKeys,
    );
  });

  it('Must call anonymousRequests', async () => {
    const cloneKeychainRequestData = objects.clone(
      keychainRequest.data,
    ) as KeychainRequest;
    cloneKeychainRequestData.type = anonymous_requests[0];
    const sAnonymousRequests = jest.spyOn(
      LogicAnonymousRequests,
      'anonymousRequests',
    );
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.msg,
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    delete cloneKeychainRequestData.username;
    await init(
      cloneKeychainRequestData,
      0,
      cloneKeychainRequestData.domain,
      keychainRequest.requestHandler,
    );
    expect(sAnonymousRequests).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestData,
      cloneKeychainRequestData.domain,
      [accounts.local.justTwoKeys],
      DefaultRpcs[0],
    );
  });

  it('Must call missingUser', async () => {
    const cloneKeychainRequestData = objects.clone(
      keychainRequest.data,
    ) as KeychainRequest;
    cloneKeychainRequestData.type = KeychainRequestTypes.post;
    const sMissingUser = jest.spyOn(LogicMissingUser, 'missingUser');
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.differentName.msg,
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    await init(
      cloneKeychainRequestData,
      0,
      cloneKeychainRequestData.domain,
      keychainRequest.requestHandler,
    );
    expect(sMissingUser).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestData,
      cloneKeychainRequestData.username!,
    );
  });

  it('Must call missingKey', async () => {
    const cloneKeychainRequestDecodeData = objects.clone(
      keychainRequest.decodeData,
    ) as KeychainRequest;
    const sMissingKey = jest.spyOn(LogicMissingKey, 'missingKey');
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.msg,
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    await init(
      cloneKeychainRequestDecodeData,
      0,
      cloneKeychainRequestDecodeData.domain,
      keychainRequest.requestHandler,
    );
    expect(sMissingKey).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestDecodeData,
      cloneKeychainRequestDecodeData.username!,
      KeychainKeyTypesLC.memo,
    );
  });

  it('Must call requestWithoutConfirmation', async () => {
    const cloneKeychainRequestPostData = objects.clone(
      keychainRequest.postData,
    ) as KeychainRequest;
    const sRequestWithoutConfirmation = jest.spyOn(
      LogicRequestWithoutConfirmation,
      'requestWithoutConfirmation',
    );
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.msg,
        current_rpc: DefaultRpcs[0],
        no_confirm: {
          'keychain.tests': { domain: { post: true } },
        },
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    await init(
      cloneKeychainRequestPostData,
      0,
      cloneKeychainRequestPostData.domain,
      keychainRequest.requestHandler,
    );
    expect(sRequestWithoutConfirmation).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestPostData,
    );
  });

  it('Must call requestWithConfirmation', async () => {
    const cloneKeychainRequestPostData = objects.clone(
      keychainRequest.postData,
    ) as KeychainRequest;
    const sRequestWithConfirmation = jest.spyOn(
      LogicRequestWithConfirmation,
      'requestWithConfirmation',
    );
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: _accounts.encrypt.msg,
        current_rpc: DefaultRpcs[0],
      });
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);
    cloneKeychainRequestPostData.username = mk.user.one;
    await init(
      cloneKeychainRequestPostData,
      0,
      cloneKeychainRequestPostData.domain,
      keychainRequest.requestHandler,
    );
    expect(sRequestWithConfirmation).toBeCalledWith(
      keychainRequest.requestHandler,
      0,
      cloneKeychainRequestPostData,
      cloneKeychainRequestPostData.domain,
      DefaultRpcs[0],
    );
  });
});

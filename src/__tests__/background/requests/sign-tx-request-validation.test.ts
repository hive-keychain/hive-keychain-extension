import { BgdHiveEngineConfigModule } from '@background/hive-engine-config.module';
import MkModule from '@background/mk.module';
import init from '@background/requests/init';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestId,
  RequestSignTx,
} from '@interfaces/keychain.interface';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import RpcUtils from '@popup/hive/utils/rpc.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import * as LogicRequestWithConfirmation from 'src/background/requests/logic/requestWithConfirmation.logic';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('signTx request validation', () => {
  const hiveEngineConfigByDefault = {
    rpc: 'https://api.hive-engine.com/rpc',
    mainnet: 'ssc-mainnet-hive',
    accountHistoryApi: 'https://history.hive-engine.com/',
  } as HiveEngineConfig;

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  beforeEach(() => {
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValue('en-US');
  });

  it('rejects expired signTx requests before confirmation', async () => {
    const request = {
      type: KeychainRequestTypes.signTx,
      username: mk.user.one,
      method: KeychainKeyTypes.active,
      rpc: DefaultRpcs[0].uri,
      domain: 'domain',
      request_id: 1,
      tx: {
        ref_block_num: 1000,
        ref_block_prefix: 123456789,
        expiration: new Date(Date.now() - 1000).toISOString(),
        operations: [
          [
            'transfer',
            {
              from: mk.user.one,
              to: 'alice',
              amount: '1.000 HIVE',
              memo: 'test',
            },
          ],
        ],
        extensions: [],
      },
    } as RequestSignTx & RequestId;

    const requestWithConfirmationSpy = jest.spyOn(
      LogicRequestWithConfirmation,
      'requestWithConfirmation',
    );

    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        accounts: 'encrypted-accounts',
        current_rpc: DefaultRpcs[0],
        no_confirm: {},
      });
    EncryptUtils.decryptToJson = jest.fn().mockResolvedValue({
      list: [{ name: mk.user.one, keys: userData.one.nonEncryptKeys }],
    });
    EncryptUtils.isEncryptedJsonV2 = jest.fn().mockReturnValue(true);
    RpcUtils.findRpc = jest.fn().mockResolvedValue(DefaultRpcs[0]);
    BgdHiveEngineConfigModule.getActiveConfig = jest
      .fn()
      .mockResolvedValue(hiveEngineConfigByDefault);

    await init(request, 0, request.domain, new RequestsHandler());

    expect(requestWithConfirmationSpy).not.toBeCalled();
    expect(chrome.tabs.sendMessage).toBeCalledWith(
      0,
      expect.objectContaining({
        command: DialogCommand.ANSWER_REQUEST,
        msg: expect.objectContaining({
          success: false,
          error: 'invalid_transaction',
          message: 'This transaction has already expired.',
        }),
      }),
    );
  });
});

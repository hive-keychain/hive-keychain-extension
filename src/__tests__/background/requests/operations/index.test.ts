import { performOperation } from '@background/requests/operations';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequestTypes,
  RequestAddAccount,
  RequestAddAccountKeys,
  RequestId,
} from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import Logger from 'src/utils/logger.utils';
import * as PreferencesUtils from 'src/utils/preferences.utils';

describe('index tests:\n', () => {
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.addAccount,
    keys: userData.one.nonEncryptKeys as RequestAddAccountKeys,
    request_id: 1,
  } as RequestAddAccount & RequestId;

  afterAll(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  it('Must call logger, addToWhitelist, reset and removeWindow', async () => {
    const cbImplementation = (moduleName: string) =>
      Promise.resolve(`mocked message for ${moduleName}`);
    const AddAccountOpModule = require('src/background/requests/operations/ops/add-account.ts');
    jest
      .spyOn(AddAccountOpModule, 'addAccount')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.addAccount),
      );
    const sSendMessage = jest
      .spyOn(chrome.tabs, 'sendMessage')
      .mockImplementation(() => undefined);
    const sLoggerInfo = jest.spyOn(Logger, 'info');
    const sLoggerLog = jest.spyOn(Logger, 'log');
    const sAddToWhitelist = jest
      .spyOn(PreferencesUtils, 'addToWhitelist')
      .mockResolvedValue(undefined);
    const sRemoveWindow = jest.spyOn(DialogLifeCycle, 'removeWindow');
    const requestHandler = new RequestsHandler();
    const sReset = jest.spyOn(requestHandler, 'reset');
    requestHandler.data.rpc = DefaultRpcs[1];
    requestHandler.data.windowId = 1;
    await performOperation(requestHandler, data, 0, 'domain', true);
    expect(sLoggerInfo).toBeCalledWith('-- PERFORMING TRANSACTION --');
    expect(sLoggerLog).toBeCalledWith(data);
    expect(sSendMessage).toBeCalledWith(
      0,
      `mocked message for ${KeychainRequestTypes.addAccount}`,
    );
    expect(sAddToWhitelist).toBeCalledWith(data.username!, 'domain', data.type);
    expect(sRemoveWindow).toBeCalledWith(requestHandler.data.windowId);
    expect(sReset).toBeCalledWith(false);
  });

  it('Must call each type of request', async () => {
    jest.spyOn(PreferencesUtils, 'addToWhitelist').mockResolvedValue(undefined);
    jest.spyOn(PreferencesUtils, 'isWhitelisted').mockReturnValue(false);
    jest.spyOn(PreferencesUtils, 'removeFromWhitelist').mockReturnValue({});
    //by passing all background/requests/operations/ops
    //mock all operations as they will execute on each unit test
    const cbImplementation = (moduleName: string) =>
      Promise.resolve(`mocked message for ${moduleName}`);
    const AddAccountOpModule = require('src/background/requests/operations/ops/add-account.ts');
    jest
      .spyOn(AddAccountOpModule, 'addAccount')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.addAccount),
      );
    const CustomOpModule = require('src/background/requests/operations/ops/custom-json.ts');
    jest
      .spyOn(CustomOpModule, 'broadcastCustomJson')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.custom));
    const VoteOpModule = require('src/background/requests/operations/ops/vote.ts');
    jest
      .spyOn(VoteOpModule, 'broadcastVote')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.vote));
    const TransferOpModule = require('src/background/requests/operations/ops/transfer.ts');
    jest
      .spyOn(TransferOpModule, 'broadcastTransfer')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.transfer),
      );
    const PostOpModule = require('src/background/requests/operations/ops/post.ts');
    jest
      .spyOn(PostOpModule, 'broadcastPost')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.post));
    const AuthorityOpModule = require('src/background/requests/operations/ops/authority.ts');
    jest
      .spyOn(AuthorityOpModule, 'broadcastAddAccountAuthority')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.addAccountAuthority),
      );
    jest
      .spyOn(AuthorityOpModule, 'broadcastRemoveAccountAuthority')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.removeAccountAuthority),
      );
    jest
      .spyOn(AuthorityOpModule, 'broadcastRemoveKeyAuthority')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.removeKeyAuthority),
      );
    jest
      .spyOn(AuthorityOpModule, 'broadcastAddKeyAuthority')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.addKeyAuthority),
      );
    const BroadcastOpModule = require('src/background/requests/operations/ops/broadcast.ts');
    jest
      .spyOn(BroadcastOpModule, 'broadcastOperations')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.broadcast),
      );
    const CreateClaimedAccountOpModule = require('src/background/requests/operations/ops/create-claimed-account.ts');
    jest
      .spyOn(CreateClaimedAccountOpModule, 'broadcastCreateClaimedAccount')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.createClaimedAccount),
      );
    const DelegationOpModule = require('src/background/requests/operations/ops/delegation.ts');
    jest
      .spyOn(DelegationOpModule, 'broadcastDelegation')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.delegation),
      );
    const WitnessVoteOpModule = require('src/background/requests/operations/ops/witness-vote.ts');
    jest
      .spyOn(WitnessVoteOpModule, 'broadcastWitnessVote')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.witnessVote),
      );
    const ProxyOpModule = require('src/background/requests/operations/ops/proxy.ts');
    jest
      .spyOn(ProxyOpModule, 'broadcastProxy')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.proxy));
    const PowerOpModule = require('src/background/requests/operations/ops/power.ts');
    jest
      .spyOn(PowerOpModule, 'broadcastPowerUp')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.powerUp));
    jest
      .spyOn(PowerOpModule, 'broadcastPowerDown')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.powerDown),
      );
    const SendTokenOpModule = require('src/background/requests/operations/ops/send-token.ts');
    jest
      .spyOn(SendTokenOpModule, 'broadcastSendToken')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.sendToken),
      );
    const ProposalsOpModule = require('src/background/requests/operations/ops/proposals.ts');
    jest
      .spyOn(ProposalsOpModule, 'broadcastCreateProposal')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.createProposal),
      );
    jest
      .spyOn(ProposalsOpModule, 'broadcastUpdateProposalVote')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.updateProposalVote),
      );
    jest
      .spyOn(ProposalsOpModule, 'broadcastRemoveProposal')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.removeProposal),
      );
    const DecodeOpModule = require('src/background/requests/operations/ops/decode-memo.ts');
    jest
      .spyOn(DecodeOpModule, 'decodeMessage')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.decode));

    const DecodeHiveModule = require('@hiveio/hive-js/lib/auth/memo');
    jest
      .spyOn(DecodeHiveModule, 'decode')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.decode));

    const EncodeOpModule = require('src/background/requests/operations/ops/encode-memo.ts');
    jest
      .spyOn(EncodeOpModule, 'encodeMessage')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.encode));
    const SignBufferOpModule = require('src/background/requests/operations/ops/sign-buffer.ts');
    jest
      .spyOn(SignBufferOpModule, 'signBuffer')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.signBuffer),
      );
    const SignTxOpModule = require('src/background/requests/operations/ops/sign-tx.ts');
    jest
      .spyOn(SignTxOpModule, 'signTx')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.signTx));
    const ConvertOpModule = require('src/background/requests/operations/ops/convert.ts');
    jest
      .spyOn(ConvertOpModule, 'convert')
      .mockImplementation(() => cbImplementation(KeychainRequestTypes.convert));
    const RecurrentTransferOpModule = require('src/background/requests/operations/ops/recurrent-transfer.ts');
    jest
      .spyOn(RecurrentTransferOpModule, 'recurrentTransfer')
      .mockImplementation(() =>
        cbImplementation(KeychainRequestTypes.recurrentTransfer),
      );

    const RequestTypeList = Object.keys(KeychainRequestTypes).filter(
      (requestType) => requestType !== 'signedCall',
    );

    const sSendMessage = jest
      .spyOn(chrome.tabs, 'sendMessage')
      .mockImplementation(() => undefined);

    for (let i = 0; i < RequestTypeList.length; i++) {
      const keychainRequestGeneric = keychainRequest.getWithAllGenericData();
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      requestHandler.data.rpc = DefaultRpcs[1];
      keychainRequestGeneric.type = RequestTypeList[i] as KeychainRequestTypes;
      await performOperation(
        requestHandler,
        keychainRequestGeneric,
        0,
        'domain',
        false,
      );
      expect(sSendMessage).toHaveBeenCalledWith(
        0,
        `mocked message for ${RequestTypeList[i]}`,
      );
      sSendMessage.mockReset();
    }
  });
});

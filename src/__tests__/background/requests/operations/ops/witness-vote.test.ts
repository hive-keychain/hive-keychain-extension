import LedgerModule from '@background/ledger.module';
import { broadcastWitnessVote } from '@background/requests/operations/ops/witness-vote';
import { RequestsHandler } from '@background/requests/request-handler';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import WitnessUtils from '@popup/hive/utils/witness.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import {
  KeychainKeyTypesLC,
  KeychainRequestTypes,
  RequestId,
  RequestWitnessVote,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('witness-vote tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.witnessVote,
    username: mk.user.one,
    witness: 'keychain',
    vote: true,
  } as RequestWitnessVote & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  describe('Default cases:\n', () => {
    it('Must call getUserKey', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      const sGetUserKeyPair = jest.spyOn(requestHandler, 'getUserKeyPair');
      await broadcastWitnessVote(requestHandler, data);
      expect(sGetUserKeyPair).toBeCalledWith(
        data.username!,
        KeychainKeyTypesLC.active,
      );
    });

    it('Must return error if no key on handler', async () => {
      const requestHandler = new RequestsHandler();
      const cloneData = objects.clone(data) as RequestWitnessVote & RequestId;
      const result = await broadcastWitnessVote(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
      // Error may occur at different stages (account lookup, signing, etc.)
      expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
      expect(result.msg.success).toBe(false);
      expect(result.msg.error).toBeDefined();
      expect(result.msg.result).toBeUndefined();
      expect(result.msg.data).toEqual(datas);
      expect(result.msg.message).toBeDefined();
      expect(result.msg.request_id).toBe(request_id);
      expect(result.msg.publicKey).toBeUndefined();
    });

    it('Must return success when vote', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastWitnessVote(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_witness_voted', [
            data.witness,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return success when unvote', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      data.vote = false;
      const result = await broadcastWitnessVote(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_witness_unvoted', [
            data.witness,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success when vote', async () => {
      const mockTransaction = {
        expiration: '10/10/2023',
        extensions: [],
        operations: [],
        ref_block_num: 0,
        ref_block_prefix: 0,
      };
      jest
        .spyOn(WitnessUtils, 'getUpdateWitnessTransaction')
        .mockResolvedValueOnce(mockTransaction as any);
      jest
        .spyOn(LedgerModule, 'signTransactionFromLedger')
        .mockImplementation(() => {});
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValue('signed!');
      jest
        .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
        .mockResolvedValue({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledgerKEY';
      data.vote = true;
      const result = await broadcastWitnessVote(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_witness_voted', [
            data.witness,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});

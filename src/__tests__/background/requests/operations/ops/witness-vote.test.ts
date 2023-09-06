import LedgerModule from '@background/ledger.module';
import { broadcastWitnessVote } from '@background/requests/operations/ops/witness-vote';
import { RequestsHandler } from '@background/requests/request-handler';
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
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

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
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('html_popup_error_while_signing_transaction'),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage(
            'html_popup_error_while_signing_transaction',
          ),
          request_id: request_id,
          publicKey: undefined,
        },
      });
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
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
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

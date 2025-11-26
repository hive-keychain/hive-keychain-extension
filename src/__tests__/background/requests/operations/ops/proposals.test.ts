import LedgerModule from '@background/ledger.module';
import {
  broadcastCreateProposal,
  broadcastRemoveProposal,
  broadcastUpdateProposalVote,
} from '@background/requests/operations/ops/proposals';
import { RequestsHandler } from '@background/requests/request-handler';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import ProposalUtils from '@popup/hive/utils/proposal.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestCreateProposal,
  RequestId,
  RequestRemoveProposal,
  RequestUpdateProposalVote,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('proposals tests:\n', () => {
  const data = {
    create: {
      domain: 'domain',
      type: KeychainRequestTypes.createProposal,
      username: mk.user.one,
      receiver: 'keychain',
      subject: 'Create a keychain coin',
      permlink: 'http://hive-keychain.com/coin',
      start: '21/12/2022',
      end: '21/12/2024',
      daily_pay: '300 HBD',
      extensions: '',
      request_id: 1,
    } as RequestCreateProposal & RequestId,
    update: {
      domain: 'domain',
      type: KeychainRequestTypes.updateProposalVote,
      username: mk.user.one,
      proposal_ids: [1],
      approve: true,
      extensions: '',
      request_id: 1,
    } as RequestUpdateProposalVote & RequestId,
    remove: {
      domain: 'domain',
      username: mk.user.one,
      type: KeychainRequestTypes.removeProposal,
      proposal_ids: '',
      extensions: '',
      request_id: 1,
    } as RequestRemoveProposal & RequestId,
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  describe('broadcastCreateProposal cases:\n', () => {
    describe('default cases:\n', () => {
      it('Must return error if bad json format', async () => {
        data.create.extensions = '{!}';
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.posting;
        const result = await broadcastCreateProposal(
          requestHandler,
          data.create,
        );
        const { request_id, ...datas } = data.create;
        expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
        expect(result.msg.success).toBe(false);
        expect(result.msg.error).toBeInstanceOf(SyntaxError);
        expect(result.msg.result).toBeUndefined();
        expect(result.msg.data).toEqual(datas);
        expect(result.msg.message).toContain('JSON');
        expect(result.msg.request_id).toBe(request_id);
        expect(result.msg.publicKey).toBeUndefined();
      });

      it('Must return error if no key on handler', async () => {
        data.create.extensions = '{"keychain":10000,"points":6}';
        const requestHandler = new RequestsHandler();
        delete requestHandler.data.key;
        const result = await broadcastCreateProposal(
          requestHandler,
          data.create,
        );
        const { request_id, ...datas } = data.create;
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

      it('Must return success', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.create.extensions = '{"keychain":10000,"points":6}';
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastCreateProposal(
          requestHandler,
          data.create,
        );
        const { request_id, ...datas } = data.create;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_create'),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });

    describe('using ledger cases:\n', () => {
      it('Must return success using ledger', async () => {
        data.create.extensions = '{"keychain":10000,"points":6}';
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = '#keyUsingLedger1234';
        const mockTransaction = {
          expiration: '10/10/2023',
          extensions: [],
          operations: [],
          ref_block_num: 0,
          ref_block_prefix: 0,
        };
        jest
          .spyOn(ProposalUtils, 'getCreateProposalTransaction')
          .mockResolvedValueOnce(mockTransaction as any);
        jest
          .spyOn(LedgerModule, 'signTransactionFromLedger')
          .mockImplementation(() => {});
        jest
          .spyOn(LedgerModule, 'getSignatureFromLedger')
          .mockResolvedValueOnce('signed!');
        jest
          .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
          .mockResolvedValue({
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          } as TransactionResult);
        const result = await broadcastCreateProposal(
          requestHandler,
          data.create,
        );
        const { request_id, ...datas } = data.create;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_create'),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });
  });

  describe('broadcastUpdateProposalVote cases:\n', () => {
    describe('default cases:\n', () => {
      it('Must return error if no key on handler', async () => {
        data.update.proposal_ids = [];
        data.update.extensions = [];
        const requestHandler = new RequestsHandler();
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const { request_id, ...datas } = data.update;
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

      it('Must return success on approvals', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.update.proposal_ids = [1, 2];
        data.update.extensions = [1, 2];
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const { request_id, ...datas } = data.update;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_votes', [
              data.update.proposal_ids.join(', #'),
            ]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });

      it('Must return success on approvals using proposal_ids as json', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.update.proposal_ids = '[1]';
        const ids_parsed = JSON.parse(data.update.proposal_ids);
        data.update.extensions = [1, 2];
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const { request_id, ...datas } = data.update;
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
            message: chrome.i18n.getMessage(
              'bgd_ops_proposal_vote',
              ids_parsed.join(', #'),
            ),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });

      it('Must return success on approval', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.update.proposal_ids = [1];
        data.update.extensions = [1, 2];
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const ids = data.update.proposal_ids[0].toString();
        const { request_id, ...datas } = data.update;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_vote', [ids]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });

      it('Must return success on disapprovals', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.update.proposal_ids = [1, 2];
        data.update.extensions = [1, 2];
        data.update.approve = false;
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const ids = data.update.proposal_ids.join(', #');
        const { request_id, ...datas } = data.update;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_unvotes', [ids]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });

      it('Must return success on disapproval', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.update.proposal_ids = [1];
        data.update.extensions = [1, 2];
        data.update.approve = false;
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const ids = data.update.proposal_ids[0].toString();
        const { request_id, ...datas } = data.update;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_unvote', [ids]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });

    describe('Using Ledger cases:\n', () => {
      it('Must return success using proposal_ids as object', async () => {
        data.update.extensions = '{"keychain":10000,"points":6}';
        data.update.approve = true;
        data.update.proposal_ids = [1];
        const mockTransaction = {
          expiration: '10/10/2023',
          extensions: [],
          operations: [],
          ref_block_num: 0,
          ref_block_prefix: 0,
        };
        jest
          .spyOn(ProposalUtils, 'getUpdateProposalVoteTransaction')
          .mockResolvedValueOnce(mockTransaction as any);
        jest
          .spyOn(LedgerModule, 'signTransactionFromLedger')
          .mockImplementation(() => {});
        jest
          .spyOn(LedgerModule, 'getSignatureFromLedger')
          .mockResolvedValueOnce('signed!');
        jest
          .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
          .mockResolvedValue({
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          } as TransactionResult);
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = '#keyUsingLedger1234';
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const { request_id, ...datas } = data.update;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_vote', [
              datas.proposal_ids[0].toString(),
            ]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });

      it('Must return success using proposal_ids as string', async () => {
        data.update.extensions = '{"keychain":10000,"points":6}';
        data.update.proposal_ids = '[1]';
        data.update.approve = true;
        const mockTransaction = {
          expiration: '10/10/2023',
          extensions: [],
          operations: [],
          ref_block_num: 0,
          ref_block_prefix: 0,
        };
        jest
          .spyOn(ProposalUtils, 'getUpdateProposalVoteTransaction')
          .mockResolvedValueOnce(mockTransaction as any);
        jest
          .spyOn(LedgerModule, 'signTransactionFromLedger')
          .mockImplementation(() => {});
        jest
          .spyOn(LedgerModule, 'getSignatureFromLedger')
          .mockResolvedValueOnce('signed!');
        jest
          .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
          .mockResolvedValue({
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          } as TransactionResult);
        data.update.extensions = '{"keychain":10000,"points":6}';
        data.update.proposal_ids = '[1]';
        data.update.approve = true;
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = '#keyUsingLedger1234';
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const { request_id, ...datas } = data.update;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_vote', ['1']),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });
  });

  describe('broadcastRemoveProposal cases:\n', () => {
    describe('default cases:\n', () => {
      it('Must return error if bad json format in proposal_ids', async () => {
        data.remove.proposal_ids = '!{}';
        data.remove.extensions = '{}';
        const requestHandler = new RequestsHandler();
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        const { request_id, ...datas } = data.remove;
        expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
        expect(result.msg.success).toBe(false);
        expect(result.msg.error).toBeInstanceOf(SyntaxError);
        expect(result.msg.result).toBeUndefined();
        expect(result.msg.data).toEqual(datas);
        expect(result.msg.message).toContain('JSON');
        expect(result.msg.request_id).toBe(request_id);
        expect(result.msg.publicKey).toBeUndefined();
      });

      it('Must return error if bad json format in extensions', async () => {
        data.remove.proposal_ids = '{}';
        data.remove.extensions = '!{!}';
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.posting;
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        const { request_id, ...datas } = data.remove;
        expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
        expect(result.msg.success).toBe(false);
        expect(result.msg.error).toBeInstanceOf(SyntaxError);
        expect(result.msg.result).toBeUndefined();
        expect(result.msg.data).toEqual(datas);
        expect(result.msg.message).toContain('JSON');
        expect(result.msg.request_id).toBe(request_id);
        expect(result.msg.publicKey).toBeUndefined();
      });

      it('Must return error if no key on handler', async () => {
        data.remove.proposal_ids = '{}';
        data.remove.extensions = '{}';
        const requestHandler = new RequestsHandler();
        delete requestHandler.data.key;
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        const { request_id, ...datas } = data.remove;
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

      it('Must return success', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.remove.proposal_ids = '{}';
        const ids = JSON.parse(data.remove.proposal_ids);
        data.remove.extensions = '{}';
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        const { request_id, ...datas } = data.remove;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_remove', [ids]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });

    describe('Using Ledger cases:\n', () => {
      it('Must return success using proposal_ids as json', async () => {
        data.remove.proposal_ids = '{}';
        const ids = JSON.parse(data.remove.proposal_ids);
        data.remove.extensions = '{}';
        const mockTransaction = {
          expiration: '10/10/2023',
          extensions: [],
          operations: [],
          ref_block_num: 0,
          ref_block_prefix: 0,
        };
        jest
          .spyOn(ProposalUtils, 'getRemoveProposalTransaction')
          .mockResolvedValueOnce(mockTransaction as any);
        jest
          .spyOn(LedgerModule, 'signTransactionFromLedger')
          .mockImplementation(() => {});
        jest
          .spyOn(LedgerModule, 'getSignatureFromLedger')
          .mockResolvedValueOnce('signed!');
        jest
          .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
          .mockResolvedValue({
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          } as TransactionResult);
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = '#ledgerKey1234';
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        const { request_id, ...datas } = data.remove;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_remove', [ids]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });

      it('Must return success using proposal_ids as object', async () => {
        data.remove.proposal_ids = [1];
        data.remove.extensions = '{}';
        const mockTransaction = {
          expiration: '10/10/2023',
          extensions: [],
          operations: [],
          ref_block_num: 0,
          ref_block_prefix: 0,
        };
        jest
          .spyOn(ProposalUtils, 'getRemoveProposalTransaction')
          .mockResolvedValueOnce(mockTransaction as any);
        jest
          .spyOn(LedgerModule, 'signTransactionFromLedger')
          .mockImplementation(() => {});
        jest
          .spyOn(LedgerModule, 'getSignatureFromLedger')
          .mockResolvedValueOnce('signed!');
        jest
          .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
          .mockResolvedValue({
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          } as TransactionResult);
        data.remove.extensions = '{}';
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = '#ledgerKey1234';
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        const { request_id, ...datas } = data.remove;
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
            message: chrome.i18n.getMessage('bgd_ops_proposal_remove', ['1']),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });
  });
});

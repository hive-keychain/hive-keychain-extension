import {
  KeychainKeyTypes,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import keychainify from 'src/content-scripts/keychainify/keychainify';
import { CommunicationUtils } from 'src/utils/communication.utils';
import KeychainifyUtils from 'src/utils/keychainify.utils';

describe('keychainify.ts tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe('requestTransfer cases:\n', () => {
    it('Must drop an invalid redirect_uri before dispatching the request', () => {
      jest
        .spyOn(KeychainifyUtils, 'isRedirectUriAcceptable')
        .mockReturnValue(false);
      const sDispatchRequest = jest
        .spyOn(keychainify, 'dispatchRequest')
        .mockImplementation(() => {});

      keychainify.requestTransfer(
        null,
        'alice',
        'bob',
        '1',
        'memo',
        'HIVE',
        'javascript:alert(1)',
      );

      expect(sDispatchRequest).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          type: KeychainRequestTypes.transfer,
          redirect_uri: '',
        }),
      );
    });
  });

  describe('requestCustomJSON cases:\n', () => {
    it('Must keep a valid redirect_uri when the validator accepts it', () => {
      jest
        .spyOn(KeychainifyUtils, 'isRedirectUriAcceptable')
        .mockReturnValue(true);
      const sDispatchRequest = jest
        .spyOn(keychainify, 'dispatchRequest')
        .mockImplementation(() => {});

      keychainify.requestCustomJSON(
        null,
        '["alice"]',
        '[]',
        'custom-id',
        '{"test":true}',
        'display message',
        'https://app.example.com/hk-callback',
      );

      expect(sDispatchRequest).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          type: 'custom',
          method: KeychainKeyTypes.posting,
          redirect_uri: 'https://app.example.com/hk-callback',
        }),
      );
    });
  });

  describe('HiveSigner links', () => {
    it('recognizes proposal vote links', () => {
      expect(
        keychainify.isSupportedHiveSignerUrl(
          'https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B373%5D&approve=true',
        ),
      ).toBe(true);
    });

    it('sends a witness vote with a boolean and a matching request id', () => {
      const send = jest
        .spyOn(CommunicationUtils, 'runtimeSendMessage')
        .mockResolvedValue(undefined);

      keychainify.keychainifyUrl(
        'https://hivesigner.com/sign/account-witness-vote?witness=stoodkev&approve=1',
      );

      const message = send.mock.calls[0][0] as {
        request_id: number;
        request: { type: string; witness: string; vote: boolean; request_id: number };
      };
      expect(message.request).toEqual(
        expect.objectContaining({
          type: KeychainRequestTypes.witnessVote,
          witness: 'stoodkev',
          vote: true,
        }),
      );
      expect(message.request.request_id).toBe(message.request_id);
    });

    it('sends a proposal vote instead of leaving the HiveSigner link to the browser', () => {
      const send = jest
        .spyOn(CommunicationUtils, 'runtimeSendMessage')
        .mockResolvedValue(undefined);

      keychainify.keychainifyUrl(
        'https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B373%5D&approve=true',
      );

      const message = send.mock.calls[0][0] as {
        request_id: number;
        request: {
          type: string;
          proposal_ids: number[];
          approve: boolean;
          request_id: number;
        };
      };
      expect(message.request).toEqual(
        expect.objectContaining({
          type: KeychainRequestTypes.updateProposalVote,
          proposal_ids: [373],
          approve: true,
          extensions: [],
        }),
      );
      expect(message.request.request_id).toBe(message.request_id);
    });
  });
});

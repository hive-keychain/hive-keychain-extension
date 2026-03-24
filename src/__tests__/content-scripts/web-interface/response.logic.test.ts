import { KeychainRequest, KeychainRequestTypes } from 'hive-keychain-commons';
import Joi from 'joi';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import * as ResponseLogicModule from 'src/content-scripts/web-interface/response.logic';
import {
  cancelPreviousRequest,
  sendIncompleteDataResponse,
  sendRequestToBackground,
  sendResponse,
} from 'src/content-scripts/web-interface/response.logic';
import KeychainifyUtils from 'src/utils/keychainify.utils';

describe('response.logic tests:\n', () => {
  const prevReq = {
    domain: 'domain',
    request_id: 1,
    type: KeychainRequestTypes.convert,
    username: userData.one.username,
    collaterized: true,
    amount: '1.000',
  } as KeychainRequest;

  const req = {} as KeychainRequest;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe('cancelPreviousRequest cases:\n', () => {
    it('Must call sendResponse', () => {
      const sSendResponse = jest
        .spyOn(ResponseLogicModule, 'sendResponse')
        .mockImplementation(() => {});

      cancelPreviousRequest(prevReq);
      expect(sSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'ignored',
        result: null,
        message: 'User ignored this transaction',
        data: prevReq,
        request_id: prevReq.request_id,
      });
    });
  });
  describe('sendRequestToBackground cases:\n', () => {
    it('Must call sendMessage', () => {
      const sSendMessage = jest
        .spyOn(chrome.runtime, 'sendMessage')
        .mockImplementation(async () => undefined);

      sendRequestToBackground(req, chrome);
      expect(sSendMessage).toHaveBeenCalledWith({
        command: 'sendRequest',
        request: req,
        domain: window.location.hostname,
        request_id: req.request_id,
      });
    });
  });
  describe('sendIncompleteDataResponse cases:\n', () => {
    it('Must call sendResponse using error as string', () => {
      const sSendResponse = jest
        .spyOn(ResponseLogicModule, 'sendResponse')
        .mockImplementation(() => {});
      sendIncompleteDataResponse(req, 'error_string');
      expect(sSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'incomplete',
        result: null,
        message: 'error_string',
        data: req,
        request_id: req.request_id,
      });
    });
    it('Must call sendResponse using error as stack', () => {
      const joiError = new Joi.ValidationError(
        'error_stack',
        [],
        'original',
      );
      const sSendResponse = jest
        .spyOn(ResponseLogicModule, 'sendResponse')
        .mockImplementation(() => {});

      sendIncompleteDataResponse(req, joiError);
      expect(sSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'incomplete',
        result: null,
        message: joiError.stack,
        data: req,
        request_id: req.request_id,
      });
    });
  });

  describe('sendResponse cases:\n', () => {
    it('Must post a message when redirect_uri is rejected', () => {
      jest
        .spyOn(KeychainifyUtils, 'isRedirectUriAcceptable')
        .mockReturnValue(false);
      const sPostMessage = jest
        .spyOn(window, 'postMessage')
        .mockImplementation(() => {});

      const response = {
        success: true,
        error: null,
        result: null,
        message: 'ok',
        data: {
          redirect_uri: 'javascript:alert(1)',
        },
        request_id: 1,
      } as any;

      sendResponse(response);

      expect(sPostMessage).toHaveBeenCalledWith(
        {
          type: 'hive_keychain_response',
          response,
        },
        window.location.origin,
      );
    });
  });
});

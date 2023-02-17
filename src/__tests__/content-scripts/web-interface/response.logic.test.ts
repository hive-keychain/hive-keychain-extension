import Joi from 'joi';
import {
  cancelPreviousRequest,
  sendIncompleteDataResponse,
  sendRequestToBackground,
} from 'src/content-scripts/web-interface/response.logic';
import responseLogicMocks from 'src/__tests__/content-scripts/web-interface/mocks/response.logic-mocks';

describe('response.logic tests:\n', () => {
  const { prevReq, spies, req } = responseLogicMocks;
  const { methods } = responseLogicMocks;
  methods.afterEach;
  describe('cancelPreviousRequest cases:\n', () => {
    it('Must call sendResponse', () => {
      cancelPreviousRequest(prevReq);
      expect(spies.sendResponse).toBeCalledWith({
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
      sendRequestToBackground(req);
      expect(spies.sendMessage).toBeCalledWith({
        command: 'sendRequest',
        request: req,
        domain: window.location.hostname,
        request_id: req.request_id,
      });
    });
  });
  describe('sendIncompleteDataResponse cases:\n', () => {
    it('Must call sendResponse using error as string', () => {
      sendIncompleteDataResponse(req, 'error_string');
      expect(spies.sendResponse).toBeCalledWith({
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
        'details_error_stack',
        'original',
      );
      sendIncompleteDataResponse(req, joiError);
      expect(spies.sendResponse).toBeCalledWith({
        success: false,
        error: 'incomplete',
        result: null,
        message: joiError.stack,
        data: req,
        request_id: req.request_id,
      });
    });
  });
});

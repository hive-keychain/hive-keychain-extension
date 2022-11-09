import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import operationsUtilsMocks from 'src/__tests__/background/requests/operations/mocks/operations.utils-mocks';
describe('operations.utils tests:\n', () => {
  const { methods, constants } = operationsUtilsMocks;
  const { data, confirmed, message } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('createMessage cases:\n', () => {
    it('Must return an answerRequest with success', () => {
      const result = createMessage(
        undefined,
        confirmed,
        data,
        message.success,
        null,
        undefined,
      );
      methods.assert.success(result, message.success);
    });
    it('Must return an answerRequest with error', () => {
      const errorMsg = 'Error while waiting confirmation';
      const result = createMessage(
        new Error(errorMsg),
        undefined,
        data,
        null,
        message.error(errorMsg),
        undefined,
      );
      methods.assert.error(result, new Error(errorMsg), data, errorMsg);
    });
  });
  describe('beautifyErrorMessage cases:\n', () => {
    it('Must return null', async () => {
      expect(await beautifyErrorMessage(null)).toBe(null);
    });
    it('Must remove an exception on error and return bgd_ops_error', async () => {
      const error = new Error(
        'Removed all around here, Exception:Private key not defined. Code 191',
      );
      const errorMessage = await beautifyErrorMessage(error);
      expect(errorMessage).toBe(
        message.error('Private key not defined. Code 191'),
      );
    });
    it('Must return an unknown_error', async () => {
      const error = new Error(' ');
      const errorMessage = await beautifyErrorMessage(error);
      expect(errorMessage).toBe(message.unknownError());
    });
  });
});

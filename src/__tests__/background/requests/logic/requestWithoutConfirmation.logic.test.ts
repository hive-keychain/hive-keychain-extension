import { performOperationFromIndex } from '@background/index';
import requestWithoutConfirmationLogic from 'src/__tests__/background/requests/logic/mocks/requestWithoutConfirmation.logic';
describe('requestWithoutConfirmation.logic tests:\n', () => {
  const { methods, constants, spies } = requestWithoutConfirmationLogic;
  const { requestHandler, tab, request } = constants;
  methods.afterEach;
  it('Must call performOperation', async () => {
    await performOperationFromIndex(requestHandler, tab, request);
    expect(spies.performOperation).toBeCalledWith(
      requestHandler,
      request,
      tab,
      request.domain,
      false,
    );
  });
});

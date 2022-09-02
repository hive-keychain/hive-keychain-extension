import { requestWithoutConfirmation } from '@background/requests/logic';
import requestWithoutConfirmationLogic from 'src/__tests__/background/requests/logic/mocks/requestWithoutConfirmation.logic';
describe('requestWithoutConfirmation.logic tests:\n', () => {
  const { methods, constants, spies } = requestWithoutConfirmationLogic;
  const { requestHandler, tab, request } = constants;
  methods.afterEach;
  it('Must call performOperation', async () => {
    await requestWithoutConfirmation(requestHandler, tab, request);
    expect(spies.performOperation).toBeCalledWith(requestHandler, tab, request);
  });
});

import { requestWithConfirmation } from '@background/requests/logic';
import requestWithConfirmationLogic from 'src/__tests__/background/requests/logic/mocks/requestWithConfirmation.logic';
describe('requestWithConfirmation.logic tests:\n', () => {
  const { methods, constants, spies, callback } = requestWithConfirmationLogic;
  const { request, tab, requestHandler, domain } = constants;
  const { current_rpc } = constants;
  methods.beforeEach;
  methods.afterEach;
  it('Must call createPopup with sendMessage callback', () => {
    requestWithConfirmation(requestHandler, tab, request, domain, current_rpc);
    expect(JSON.stringify(spies.createPopup.mock.calls[0][0])).toEqual(
      JSON.stringify(callback.sendMessage),
    );
    expect(spies.createPopup.mock.calls[0][1]).toEqual(requestHandler);
  });
});

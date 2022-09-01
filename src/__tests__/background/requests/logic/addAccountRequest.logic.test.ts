import { addAccountRequest } from '@background/requests/logic/addAccountRequest.logic';
import addAccountRequestLogic from 'src/__tests__/background/requests/logic/mocks/addAccountRequest.logic';
describe('addAccountRequest.logic tests:\n', () => {
  const { constants, spies, callback, methods } = addAccountRequestLogic;
  const { request, domain, tab, account, requestHandler } = constants;
  methods.beforeEach;
  methods.afterEach;
  it('Must call createPopup with sendError callback', () => {
    addAccountRequest(requestHandler, tab, request, domain, account);
    expect(JSON.stringify(spies.createPopup.mock.calls[0][0])).toEqual(
      JSON.stringify(callback.sendErrors),
    );
    expect(spies.createPopup.mock.calls[0][1]).toEqual(requestHandler);
  });
  it('Must call createPopup with sendMessage callback', () => {
    addAccountRequest(requestHandler, tab, request, domain);
    expect(JSON.stringify(spies.createPopup.mock.calls[0][0])).toEqual(
      JSON.stringify(callback.sendMessage),
    );
    expect(spies.createPopup.mock.calls[0][1]).toEqual(requestHandler);
  });
});

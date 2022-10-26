import { addAccountRequest } from '@background/requests/logic/addAccountRequest.logic';
import addAccountRequestLogic from 'src/__tests__/background/requests/logic/mocks/addAccountRequest.logic';
describe('addAccountRequest.logic tests:\n', () => {
  const { constants, spies, callback, methods } = addAccountRequestLogic;
  const { request, domain, tab, account, requestHandler } = constants;
  methods.afterEach;
  it('Must call createPopup with sendMessage callback', () => {
    addAccountRequest(requestHandler, tab, request, domain);
    expect(
      spies.createPopup.mock.calls[0][0].toString().replace(/\s/g, ''),
    ).toEqual(callback.sendMessage.toString().replace(/\s/g, ''));
  });
  it('Must call createPopup with sendError callback', () => {
    addAccountRequest(requestHandler, tab, request, domain, account);
    expect(
      spies.createPopup.mock.calls[0][0].toString().replace(/\s/g, ''),
    ).toEqual(callback.sendErrors.toString().replace(/\s/g, ''));
  });
});

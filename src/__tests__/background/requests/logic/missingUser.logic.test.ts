import { missingUser } from '@background/requests/logic';
import missingUserLogic from 'src/__tests__/background/requests/logic/mocks/missingUser.logic';
describe('missingUser.logic tests:\n', () => {
  const { methods, constants, spies, callback } = missingUserLogic;
  const { request, tab, requestHandler, username } = constants;
  methods.beforeEach;
  methods.afterEach;
  it('Must call createPopup with sendErrors callback', () => {
    missingUser(requestHandler, tab, request, username);
    expect(JSON.stringify(spies.createPopup.mock.calls[0][0])).toEqual(
      JSON.stringify(callback.sendErrors),
    );
    expect(spies.createPopup.mock.calls[0][1]).toEqual(requestHandler);
  });
});

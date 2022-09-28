import { missingKey } from '@background/requests/logic';
import missingKeyLogic from 'src/__tests__/background/requests/logic/mocks/missingKey.logic';
describe('missingKey.logic tests:\n', () => {
  const { methods, constants, spies, callback } = missingKeyLogic;
  const { request, tab, requestHandler, username } = constants;
  const { typeWif } = constants;
  methods.afterEach;
  it('Must call createPopup with sendErrors callback', () => {
    missingKey(requestHandler, tab, request, username, typeWif);
    expect(spies.createPopup.mock.calls[0][0].toString()).toEqual(
      callback.sendErrors.toString(),
    );
  });
});

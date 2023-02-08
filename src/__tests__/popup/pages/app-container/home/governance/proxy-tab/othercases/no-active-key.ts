import proxy from 'src/__tests__/popup/pages/app-container/home/governance/proxy-tab/mocks/proxy';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';

const { constants } = proxy;

const run = () => {
  it('Must show error trying to set proxy', async () => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.username,
        event: EventType.TYPE,
        text: 'keychain',
      },
      {
        ariaLabel: alButton.operation.proxy.tab.setAsProxy,
        event: EventType.CLICK,
      },
    ]);
    await assertion.awaitFor(constants.missingKey, QueryDOM.BYTEXT);
  });
};

export default { run };

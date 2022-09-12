import whatsNew from 'src/__tests__/popup/pages/app-container/whats-new/mocks/whats-new';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alLink from 'src/__tests__/utils-for-testing/aria-labels/al-link';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickAwaitOnFound,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('whats-new.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants, extraMocks } = whatsNew;
  const { snapshotName, versionLog } = constants;
  methods.afterEach;
  describe('Same app versions:\n', () => {
    beforeEach(async () => {
      _asFragment = await whatsNew.beforeEach();
    });
    it('Must not show whats new component', () => {
      assertion.queryByLabel(alComponent.whatsNew, false);
    });
  });
  describe('Different app versions:\n', () => {
    beforeEach(async () => {
      _asFragment = await whatsNew.beforeEach(true);
      await assertion.awaitFor(alComponent.whatsNew, QueryDOM.BYLABEL);
    });
    it('Must show whats new component', async () => {
      expect(_asFragment()).toMatchSnapshot(snapshotName.withData);
    });
    it('Must open whats new, url link', async () => {
      await clickAwaitOnFound(alLink.whatsNew.link.readMore, 0);
      expect(extraMocks.spyChromeTab()).toBeCalledWith({
        url: versionLog.data.url + '#' + versionLog.data.features.en[0].anchor,
      });
    });
    it('Must close whats new', async () => {
      await clickAwait([
        alButton.whatsNew.button.nextPage,
        alButton.whatsNew.button.nextPage,
        alButton.whatsNew.button.nextPage,
      ]);
      await clickAwait([alButton.whatsNew.button.lastPage]);
      assertion.queryByLabel(alComponent.whatsNew, false);
    });
  });
});

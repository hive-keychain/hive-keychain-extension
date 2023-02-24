import { act, waitFor } from '@testing-library/react';
import whatsNew from 'src/__tests__/popup/pages/app-container/whats-new/mocks/whats-new';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alLink from 'src/__tests__/utils-for-testing/aria-labels/al-link';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  clickAwait,
  clickAwaitOnFound,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
afterTests.resetGlobalImage();
describe('whats-new.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants, extraMocks } = whatsNew;
  const { versionLog } = constants;
  methods.afterEach;
  describe('Same app versions:\n', () => {
    beforeEach(async () => {
      _asFragment = await whatsNew.beforeEach();
      actAdvanceTime(1000);
    });
    it('Must not show whats new component', () => {
      assertion.queryByLabel(alComponent.whatsNew, false);
    });
  });
  describe('Different app versions:\n', () => {
    ////manipulate Image prototype onload function////
    let imageOnload: () => {} | null;
    /**
     * Notes: Add methods as needed.
     * imageOnload must be defined on outside scope and invoked within the case.
     * imageOnload needs be wrapped in act as it will affect the renders.
     * the function itself must be defined before render and called using beforeAll.
     * Important: ALWAYS remember to call afterTests.resetGlobalImage();
     */
    const addOnLoadOnImage = () => {
      Object.defineProperty(Image.prototype, 'onload', {
        get: function () {
          return this._onload;
        },
        set: function (fn) {
          imageOnload = fn;
          this._onload = fn;
        },
      });
    };
    beforeAll(() => {
      addOnLoadOnImage();
    });
    ////////
    beforeEach(async () => {
      _asFragment = await whatsNew.beforeEach(true);
      actAdvanceTime(1000);
    });
    it('Must show whats new component', async () => {
      act(() => {
        imageOnload();
      });
      await waitFor(() => {
        assertion.getByLabelText(alComponent.whatsNew);
      });
    });

    it('Must open whats new, url link', async () => {
      act(() => {
        imageOnload();
      });
      await clickAwaitOnFound(alLink.whatsNew.link.readMore, 0);
      expect(extraMocks.spyChromeTab()).toBeCalledWith({
        url: versionLog.url + '#' + versionLog.features.en[0].anchor,
      });
    });

    it('Must close whats new', async () => {
      act(() => {
        imageOnload();
      });
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

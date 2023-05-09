import { AutoLockType } from '@interfaces/autolock.interface';
import { screen, waitFor } from '@testing-library/react';
import autoLock from 'src/__tests__/popup/pages/app-container/settings/advanced-settings/auto-lock/mocks/auto-lock';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import LocalStorageUtils from 'src/utils/localStorage.utils';
config.byDefault();
describe('auto-lock.component tests:\n', () => {
  const { methods, constants } = autoLock;
  let _asFragment: () => {};
  methods.afterEach;
  methods.afterAll;
  describe('General cases:\n', () => {
    beforeEach(async () => {
      chrome.runtime.sendMessage = jest.fn();
      LocalStorageUtils.saveValueInLocalStorage = jest.fn();
      _asFragment = await autoLock.beforeEach();
      await methods.gotoAutoLock();
    });
    it('Must load autolock page', () => {
      assertion.getByLabelText(alComponent.advanceSettings.autoLock);
    });
    //TODO check & fix!
    // it('Must set autolock by click, show message and goback to advanced menu', async () => {
    //   await clickAwait([
    //     alCheckbox.autoLock.preFix + AutoLockType.DEVICE_LOCK,
    //     alButton.save,
    //   ]);
    //   expect(methods.spy.saveValueInLocalStorage().mock.calls[1]).toEqual([
    //     LocalStorageKeyEnum.AUTOLOCK,
    //     { mn: 1, type: AutoLockType.DEVICE_LOCK },
    //   ]);
    //   await assertion.awaitFor(constants.message.saved, QueryDOM.BYTEXT);
    //   assertion.getByLabelText(alComponent.settingsPage);
    // });
    it('Must show input when click', async () => {
      await clickAwait([alCheckbox.autoLock.preFix + AutoLockType.IDLE_LOCK]);
      await waitFor(() => {
        assertion.queryByLabel(alInput.amount);
      });
    });
    //TODO check & fix!
    // it('Must set autolock by enter, show message and goback to advanced menu', async () => {
    //   await clickTypeAwait([
    //     {
    //       ariaLabel: alCheckbox.autoLock.preFix + AutoLockType.IDLE_LOCK,
    //       event: EventType.CLICK,
    //     },
    //     { ariaLabel: alInput.amount, event: EventType.TYPE, text: '0{enter}' },
    //   ]);
    //   await waitFor(() => {
    //     expect(methods.spy.saveValueInLocalStorage().mock.calls[1]).toEqual([
    //       LocalStorageKeyEnum.AUTOLOCK,
    //       { mn: '10', type: AutoLockType.IDLE_LOCK },
    //     ]);
    //   });
    //   await assertion.awaitFor(constants.message.saved, QueryDOM.BYTEXT);
    //   await waitFor(() => {
    //     assertion.getByLabelText(alComponent.settingsPage);
    //   });
    // });
  });
  describe('Custom stored data:\n', () => {
    beforeEach(async () => {
      _asFragment = await autoLock.beforeEach({
        mn: 3,
        type: AutoLockType.DEVICE_LOCK,
      });
      await methods.gotoAutoLock();
    });
    it('Must load stored autolock value and have 1 checkbox checked', () => {
      expect(screen.getAllByRole('checkbox')[1]).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  });
  describe('Manual Lock', () => {
    beforeEach(async () => {
      _asFragment = await autoLock.beforeEach();
    });
    it('Must lock the app', async () => {
      await clickAwait([alButton.logOut]);
      assertion.getByLabelText(alComponent.signIn);
    });
  });
});

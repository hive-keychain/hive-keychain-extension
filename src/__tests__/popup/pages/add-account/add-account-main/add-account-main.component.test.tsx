import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import React from 'react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

config.useChrome();
jest.setTimeout(10000);

describe('add-account-main.component tests:\n', () => {
  beforeEach(() => {
    mockPreset.setOrDefault({
      app: { hasStoredAccounts: false },
    });
    jest.useFakeTimers('legacy');
    actAdvanceTime(4300);
  });
  afterEach(() => {
    afterTests.clean();
  });

  it('Must navigate to add-by-keys', async () => {
    renders.wInitialState(<App />, initialStates.iniState);
    await act(async () => {
      await userEventPendingTimers.click(
        await screen.findByLabelText(alButton.addByKeys),
      );
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText(alComponent.addByKeysPage),
      ).toBeInTheDocument();
    });
  });
  it('Must navigate to add-by-auth', async () => {
    mockPreset.setOrDefault({
      app: { hasStoredAccounts: true },
    });
    renders.wInitialState(<App />, {
      ...initialStates.iniState,
      accounts: accounts.twoAccounts,
    });
    expect(await screen.findByText(mk.user.one)).toBeInTheDocument();
    await act(async () => {
      await userEventPendingTimers.click(screen.getByLabelText(alButton.menu));
      await userEventPendingTimers.click(
        screen.getByLabelText(alButton.menuSettingsPeople),
      );
      await userEventPendingTimers.click(
        screen.getByLabelText(alButton.menuSettingsPersonAdd),
      );
      await userEventPendingTimers.click(
        screen.getByLabelText(alButton.addByAuth),
      );
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText(alComponent.addByAuthPage),
      ).toBeInTheDocument();
    });
  });
  it('Must call handleImportKeys when clicked', async () => {
    const spyGetCurrent = jest.spyOn(chrome.windows, 'getCurrent');
    renders.wInitialState(<App />, initialStates.iniState);
    await act(async () => {
      await userEventPendingTimers.click(
        await screen.findByLabelText(alButton.importKeys),
      );
    });
    expect(spyGetCurrent).toBeCalledTimes(1);
  });
});

import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import React from 'react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import mockPreset from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';

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
    customRender(<App />, {
      initialState: {
        mk: mk.user.one,
        accounts: [],
        activeRpc: rpc.fake,
      } as RootState,
    });
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
    customRender(<App />, {
      initialState: {
        mk: mk.user.one,
        accounts: accounts.twoAccounts,
        activeRpc: rpc.fake,
      } as RootState,
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
});

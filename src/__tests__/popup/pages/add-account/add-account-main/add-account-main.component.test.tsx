import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import React from 'react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import mockPreset from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import {
  actAdvanceTime,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

describe('add-account-main.component tests:\n', () => {
  const render = () => {
    customRender(<App />, {
      initialState: {
        mk: mk.user.one,
        accounts: [],
        activeRpc: rpc.fake,
      } as RootState,
    });
  };
  beforeEach(() => {
    mockPreset.setOrDefault({
      app: { hasStoredAccounts: false },
    });
    // mocks.mocksApp({
    //   fixPopupOnMacOs: jest.fn(),
    //   getValueFromLocalStorage: jest
    //     .fn()
    //     .mockImplementation(mocks.getValuefromLS),
    //   getCurrentRpc: rpc,
    //   activeAccountUsername: mk,
    //   getRCMana: fakeData.manabar.manabarMin,
    //   getAccounts: fakeData.accounts.extendedAccountFull,
    //   rpcStatus: true,
    //   setRpc: jest.fn(),
    //   chromeSendMessage: jest.fn(),
    //   hasStoredAccounts: false,
    //   mkLocal: mk,
    //   getAccountsFromLocalStorage: accounts,
    //   hasVotedForProposal: false,
    //   voteForKeychainProposal: jest.fn(),
    //   chromeTabsCreate: jest.fn(),
    //   i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
    //   saveValueInLocalStorage: jest.fn(),
    //   clearLocalStorage: jest.fn(),
    //   removeFromLocalStorage: jest.fn(),
    // });
    // mocks.mocksHome({
    //   getPrices: fakeData.prices,
    //   getAccountValue: '100000',
    // });
    // mocks.mocksTopBar({
    //   hasReward: false,
    // });
    jest.useFakeTimers('legacy');
    actAdvanceTime(4300);
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });

  it('Must navigate to add-by-keys', async () => {
    // customRender(<App />, {
    //   initialState: {
    //     mk: mk.user.one,
    //     accounts: [],
    //     activeRpc: rpc.fake,
    //   } as RootState,
    // });
    render();
    await act(async () => {
      await userEventPendingTimers.click(
        await screen.findByLabelText(alButton.addByKeys),
      );
    });
    // await actPendingTimers();
    await waitFor(() => {
      expect(
        screen.getByLabelText(alComponent.addByKeysPage),
      ).toBeInTheDocument();
    });
  });
  it.skip('Must navigate to add-by-auth', async () => {
    //TODO; finish as must laod from home until reach here because of the accoounts.lengt condition
    //       AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValue(true);
    //       customRender(<App />, {
    //         initialState: { mk: mk, accounts: accounts } as RootState,
    //       });
    //       await act(async () => {
    //         jest.runOnlyPendingTimers();
    //       });
    //       menuSettings = await screen.findByLabelText(al.button.menu);
    //       await act(async () => {
    //         await userEventPendingTimers.click(menuSettings);
    //       });
    //       accountsMenu = screen.getByLabelText(al.button.menuSettingsPeople);
    //       await act(async () => {
    //         await userEventPendingTimers.click(accountsMenu);
    //       });
    //       addPersonMenu = screen.getByLabelText(al.button.menuSettingsPersonAdd);
    //       await act(async () => {
    //         await userEventPendingTimers.click(addPersonMenu);
    //       });
    // render();
    // await act(async () => {
    //   await userEventPendingTimers.click(
    //     await screen.findByLabelText(alButton.addByAuth),
    //   );
    // });
    // await waitFor(() => {
    //   expect(screen.getByLabelText('add-by-auth-page')).toBeDefined();
    // });
  });
});

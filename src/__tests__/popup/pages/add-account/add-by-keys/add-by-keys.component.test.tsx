import App from '@popup/App';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import React from 'react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import userData from 'src/__tests__/utils-for-testing/data/userData';
import { overWriteMocks } from 'src/__tests__/utils-for-testing/defaults/overwrite';
import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
import mockPreset from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
import { OverwriteMock } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import {
  actAdvanceTime,
  actPendingTimers,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

//TODO fix and finish

describe('add-by-keys tests:\n', () => {
  const OW = OverwriteMock.SET_AS_NOT_IMPLEMENTED;

  beforeEach(() => {
    mockPreset.setOrDefault({
      app: { hasStoredAccounts: false },
    });
    overWriteMocks({ app: { setRpc: OW } });
    jest.useFakeTimers('legacy');
    actAdvanceTime(4300);
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });
  it('Must add valid posting key and load homepage', async () => {
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
      await userEventPendingTimers.type(
        screen.getByLabelText(alInput.username),
        mk.user.one,
      );
      await userEventPendingTimers.type(
        screen.getByLabelText(alInput.privateKey),
        userData.one.nonEncryptKeys.posting,
      );
      await userEventPendingTimers.click(
        screen.getByLabelText(alButton.submit),
      );
    });
    await actPendingTimers();
    await waitFor(() => {
      expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
      expect(screen.getByText(mk.user.one)).toBeDefined();
    });
  });
  it('Must add valid memo key and load homepage', async () => {
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
      await userEventPendingTimers.type(
        screen.getByLabelText(alInput.username),
        mk.user.one,
      );
      await userEventPendingTimers.type(
        screen.getByLabelText(alInput.privateKey),
        userData.one.nonEncryptKeys.memo,
      );
      await userEventPendingTimers.click(
        screen.getByLabelText(alButton.submit),
      );
    });
    await actPendingTimers();
    await waitFor(() => {
      expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
      expect(screen.getByText(mk.user.one)).toBeDefined();
    });
  });
  // it('Must add valid active key and load homepage', async () => {
  //   customRender(<App />, {
  //     initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
  //   expect(addByKeysButton).toBeDefined();
  //   await act(async () => {
  //     await userEventPendingTimers.click(addByKeysButton);
  //   });
  //   const inputUsername = screen.getByLabelText(al.input.username);
  //   const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
  //   const submitButton = screen.getByLabelText(al.button.submit);
  //   await act(async () => {
  //     await userEventPendingTimers.type(inputUsername, mk);
  //     await userEventPendingTimers.type(
  //       inputPrivateKey,
  //       utilsT.userData.nonEncryptKeys.active,
  //     );
  //     await userEventPendingTimers.click(submitButton);
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   await waitFor(() => {
  //     expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
  //     expect(screen.getByText(mk)).toBeDefined();
  //   });
  // });
  // it('Must derivate all keys from master, and navigate to select keys page', async () => {
  //   customRender(<App />, {
  //     initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
  //   expect(addByKeysButton).toBeDefined();
  //   await act(async () => {
  //     await userEventPendingTimers.click(addByKeysButton);
  //   });
  //   const inputUsername = screen.getByLabelText(al.input.username);
  //   const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
  //   const submitButton = screen.getByLabelText(al.button.submit);
  //   await act(async () => {
  //     await userEventPendingTimers.type(inputUsername, mk);
  //     await userEventPendingTimers.type(
  //       inputPrivateKey,
  //       utilsT.userData.nonEncryptKeys.master,
  //     );
  //     await userEventPendingTimers.click(submitButton);
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   await waitFor(() => {
  //     expect(screen.getByLabelText(al.component.selectPage)).toBeDefined();
  //     expect(screen.getByText('Posting Key')).toBeDefined();
  //     expect(screen.getByText('Active Key')).toBeDefined();
  //     expect(screen.getByText('Memo Key')).toBeDefined();
  //   });
  // });
  // it.skip('Must show error if empty username and empty password', async () => {
  //   //TODO: waiting for fixes on dispatcher.
  //   customRender(<App />, {
  //     initialState: {
  //       mk: mk,
  //       accounts: [],
  //     } as RootState,
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
  //   expect(addByKeysButton).toBeDefined();
  //   await act(async () => {
  //     await userEventPendingTimers.click(addByKeysButton);
  //   });
  //   const submitButton = screen.getByLabelText(al.button.submit);
  //   await act(async () => {
  //     await userEventPendingTimers.click(submitButton);
  //   });
  //   await waitFor(() => {
  //     expect(screen.getByText(fakeData.messages.missingFields)).toBeDefined();
  //   });
  // });
  // it('Must show error if existing key', async () => {
  //   customRender(<App />, {
  //     initialState: {
  //       mk: mk,
  //       accounts: accounts,
  //     } as RootState,
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   const menuButton = await screen.findByLabelText(al.button.menu);
  //   expect(menuButton).toBeDefined();
  //   await act(async () => {
  //     await userEventPendingTimers.click(menuButton);
  //   });
  //   const menuSettingButtonPeople = screen.getByLabelText(
  //     al.button.menuSettingsPeople,
  //   );
  //   await act(async () => {
  //     await userEventPendingTimers.click(menuSettingButtonPeople);
  //   });
  //   const menuSettingsButtonPersonAdd = screen.getByLabelText(
  //     al.button.menuSettingsPersonAdd,
  //   );
  //   await act(async () => {
  //     await userEventPendingTimers.click(menuSettingsButtonPersonAdd);
  //   });
  //   const addByKeysButton = screen.getByLabelText(al.button.addByKeys);
  //   await act(async () => {
  //     await userEventPendingTimers.click(addByKeysButton);
  //   });
  //   const inputUsername = screen.getByLabelText(al.input.username);
  //   const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
  //   const submitButton = screen.getByLabelText(al.button.submit);
  //   await act(async () => {
  //     await userEventPendingTimers.type(inputUsername, mk);
  //     await userEventPendingTimers.type(
  //       inputPrivateKey,
  //       utilsT.userData.nonEncryptKeys.active,
  //     );
  //     await userEventPendingTimers.click(submitButton);
  //   });
  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(fakeData.messages.existingAccount),
  //     ).toBeDefined();
  //   });
  // });
  // it.skip('Must show error when using a public key', async () => {
  //   //TODO: waiting for fixes on dispatcher.
  //   customRender(<App />, {
  //     initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
  //   expect(addByKeysButton).toBeDefined();
  //   await act(async () => {
  //     await userEventPendingTimers.click(addByKeysButton);
  //   });
  //   const inputUsername = screen.getByLabelText(al.input.username);
  //   const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
  //   const submitButton = screen.getByLabelText(al.button.submit);
  //   await act(async () => {
  //     await userEventPendingTimers.type(inputUsername, mk);
  //     await userEventPendingTimers.type(
  //       inputPrivateKey,
  //       utilsT.userData.encryptKeys.active,
  //     );
  //     await userEventPendingTimers.click(submitButton);
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(fakeData.messages.error.publicKey),
  //     ).toBeDefined();
  //   });
  // });
  // it.skip('Must show error when using an incorrect key', async () => {
  //   //TODO: waiting for fixes on dispatcher.
  //   customRender(<App />, {
  //     initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
  //   expect(addByKeysButton).toBeDefined();
  //   await act(async () => {
  //     await userEventPendingTimers.click(addByKeysButton);
  //   });
  //   const inputUsername = screen.getByLabelText(al.input.username);
  //   const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
  //   const submitButton = screen.getByLabelText(al.button.submit);
  //   await act(async () => {
  //     await userEventPendingTimers.type(inputUsername, mk);
  //     await userEventPendingTimers.type(
  //       inputPrivateKey,
  //       utilsT.userData.nonEncryptKeys.randomStringKey51,
  //     );
  //     await userEventPendingTimers.click(submitButton);
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(fakeData.messages.error.incorrectKeyOrPassword),
  //     ).toBeDefined();
  //   });
  // });
  // it.skip('Must show error when using an incorrect username', async () => {
  //   //TODO: waiting for fixes on dispatcher.
  //   HiveUtils.getClient().database.getAccounts = jest
  //     .fn()
  //     .mockResolvedValueOnce([]);
  //   customRender(<App />, {
  //     initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
  //   expect(addByKeysButton).toBeDefined();
  //   await act(async () => {
  //     await userEventPendingTimers.click(addByKeysButton);
  //   });
  //   const inputUsername = screen.getByLabelText(al.input.username);
  //   const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
  //   const submitButton = screen.getByLabelText(al.button.submit);
  //   await act(async () => {
  //     await userEventPendingTimers.type(inputUsername, 'invalid_username');
  //     await userEventPendingTimers.type(
  //       inputPrivateKey,
  //       utilsT.userData.nonEncryptKeys.randomStringKey51,
  //     );
  //     await userEventPendingTimers.click(submitButton);
  //   });
  //   await act(async () => {
  //     jest.runOnlyPendingTimers();
  //   });
  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(fakeData.messages.error.incorrectUser),
  //     ).toBeDefined();
  //   });
  // });
});

import App from '@popup/App';
import { cleanup, screen, waitFor } from '@testing-library/react';
import React from 'react';
import addByKeysMocks from 'src/__tests__/popup/pages/add-account/add-by-keys/mocks/add-by-keys-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
import {
  EventType,
  InputField,
} from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import {
  actAdvanceTime,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';
const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

const userKeys = {
  posting: userData.one.nonEncryptKeys.posting,
  active: userData.one.nonEncryptKeys.active,
  memo: userData.one.nonEncryptKeys.memo,
  master: userData.one.nonEncryptKeys.master,
};

describe('add-by-keys tests:\n', () => {
  beforeEach(async () => {
    jest.useFakeTimers('legacy');
    actAdvanceTime(4300);
    mockPreset.setOrDefault({
      app: { hasStoredAccounts: false },
    });
    renders.wInitialState(<App />, {
      ...initialStates.iniState,
      accounts: [],
    });
    expect(
      await screen.findByLabelText(alButton.addByKeys),
    ).toBeInTheDocument();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });

  it('Must add valid posting key and load homepage', async () => {
    await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.posting);
    await waitFor(() => {
      expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
      expect(screen.getByText(mk.user.one)).toBeDefined();
    });
  });
  it('Must add valid memo key and load homepage', async () => {
    await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.memo);
    await waitFor(() => {
      expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
      expect(screen.getByText(mk.user.one)).toBeDefined();
    });
  });
  it('Must add valid active key and load homepage', async () => {
    await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.active);
    await waitFor(() => {
      expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
      expect(screen.getByText(mk.user.one)).toBeDefined();
    });
  });
  it('Must derivate all keys from master, and navigate to select keys page', async () => {
    await addByKeysMocks.typeAndSubmit(userData.one.nonEncryptKeys.master);
    await waitFor(() => {
      expect(screen.getByLabelText(al.component.selectPage)).toBeDefined();
      expect(
        ['Posting Key', 'Active Key', 'Memo Key'].forEach((userKey) => {
          expect(screen.getByText(userKey)).toBeInTheDocument();
        }),
      );
    });
  });
  it.skip('Must show error if empty username', async () => {
    //TODO: waiting for fixes on dispatcher.
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_fill',
    );
    await addByKeysMocks.typeAndSubmitWEmpty(
      userData.one.nonEncryptKeys.active,
      InputField.USERNAME,
    );
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });
  it.skip('Must show error if empty password', async () => {
    //TODO: waiting for fixes on dispatcher.
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_fill',
    );
    await addByKeysMocks.typeAndSubmitWEmpty(
      userData.one.username,
      InputField.PRIVATEKEY,
    );
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });
  it.skip('Must show error if empty username and empty password', async () => {
    //TODO: waiting for fixes on dispatcher.
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_fill',
    );
    await clickTypeAwait([
      { ariaLabel: alButton.addByKeys, event: EventType.CLICK },
      { ariaLabel: alButton.submit, event: EventType.CLICK },
    ]);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });
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

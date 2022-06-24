import { cleanup } from '@testing-library/react';
import { overWriteMocks } from 'src/__tests__/utils-for-testing/defaults/overwrite';
import mockPreset from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
import { OverwriteMock } from 'src/__tests__/utils-for-testing/enums/enums';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

//TODO fix and finish.

describe('add-by-auth tests:\n', () => {
  //const mk = fakeData.mk.userData1;
  //const rpc = fakeData.rpc.fake;
  //const accounts = fakeData.accounts.twoAccounts;
  // --> beware of this 2 accounts as may differ with tests bellow.
  const OW = OverwriteMock.SET_AS_NOT_IMPLEMENTED;

  beforeEach(() => {
    mockPreset.setOrDefault({
      app: { hasStoredAccounts: false },
    });
    overWriteMocks({ app: { setRpc: OW } });
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

  //   describe('add-by-auth tests:\n', () => {
  //     let menuSettings: HTMLElement;
  //     let accountsMenu: HTMLElement;
  //     let addPersonMenu: HTMLElement;
  //     let addByAuthButton: HTMLElement;
  //     beforeEach(async () => {
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
  //     });
  //     it('Must show error trying to add existing account', async () => {
  //       addByAuthButton = screen.getByLabelText(al.button.addByAuth);
  //       await act(async () => {
  //         await userEventPendingTimers.click(addByAuthButton);
  //       });
  //       const inputUsername = screen.getByLabelText(al.input.username);
  //       const inputAuthorizedAccount = screen.getByLabelText(
  //         al.input.authorizedAccount,
  //       );
  //       const submitButton = screen.getByLabelText(al.button.submit);
  //       await act(async () => {
  //         await userEventPendingTimers.type(
  //           inputUsername,
  //           utilsT.userData.username,
  //         );
  //         await userEventPendingTimers.type(
  //           inputAuthorizedAccount,
  //           'theghost1980',
  //         );
  //         await userEventPendingTimers.click(submitButton);
  //       });
  //       await waitFor(() => {
  //         expect(
  //           screen.getByText(fakeData.messages.existingAccount),
  //         ).toBeDefined();
  //       });
  //     });
  //     it('Must show error with empty username and authorized account', async () => {
  //       addByAuthButton = screen.getByLabelText(al.button.addByAuth);
  //       await act(async () => {
  //         await userEventPendingTimers.click(addByAuthButton);
  //       });
  //       const submitButton = screen.getByLabelText(al.button.submit);
  //       await act(async () => {
  //         await userEventPendingTimers.click(submitButton);
  //       });
  //       await waitFor(() => {
  //         expect(screen.getByText(fakeData.messages.missingFields)).toBeDefined();
  //       });
  //     });
  //     it('Must show error if account not present in local accounts', async () => {
  //       addByAuthButton = screen.getByLabelText(al.button.addByAuth);
  //       await act(async () => {
  //         await userEventPendingTimers.click(addByAuthButton);
  //       });
  //       const inputUsername = screen.getByLabelText(al.input.username);
  //       const inputAuthorizedAccount = screen.getByLabelText(
  //         al.input.authorizedAccount,
  //       );
  //       const submitButton = screen.getByLabelText(al.button.submit);
  //       await act(async () => {
  //         await userEventPendingTimers.type(inputUsername, 'theghost1980');
  //         await userEventPendingTimers.type(
  //           inputAuthorizedAccount,
  //           'no_auth_account',
  //         );
  //         await userEventPendingTimers.click(submitButton);
  //       });
  //       await waitFor(() => {
  //         expect(screen.getByText(fakeData.messages.addToAuth)).toBeDefined();
  //       });
  //     });
  //     it('Must show error if account not found on hive', async () => {
  //       HiveUtils.getClient().database.getAccounts = jest
  //         .fn()
  //         .mockResolvedValue([]);
  //       addByAuthButton = screen.getByLabelText(al.button.addByAuth);
  //       await act(async () => {
  //         await userEventPendingTimers.click(addByAuthButton);
  //       });
  //       const inputUsername = screen.getByLabelText(al.input.username);
  //       const inputAuthorizedAccount = screen.getByLabelText(
  //         al.input.authorizedAccount,
  //       );
  //       const submitButton = screen.getByLabelText(al.button.submit);
  //       await act(async () => {
  //         await userEventPendingTimers.type(inputUsername, 'theghost1980');
  //         await userEventPendingTimers.type(
  //           inputAuthorizedAccount,
  //           utilsT.userData.username,
  //         );
  //         await userEventPendingTimers.click(submitButton);
  //       });
  //       await waitFor(() => {
  //         expect(
  //           screen.getByText(fakeData.messages.error.incorrectUser),
  //         ).toBeDefined();
  //       });
  //     });
  //     it('Must show error if account is not authorized', async () => {
  //       addByAuthButton = screen.getByLabelText(al.button.addByAuth);
  //       await act(async () => {
  //         await userEventPendingTimers.click(addByAuthButton);
  //       });
  //       const inputUsername = screen.getByLabelText(al.input.username);
  //       const inputAuthorizedAccount = screen.getByLabelText(
  //         al.input.authorizedAccount,
  //       );
  //       const submitButton = screen.getByLabelText(al.button.submit);
  //       await act(async () => {
  //         await userEventPendingTimers.type(inputUsername, 'theghost1980');
  //         await userEventPendingTimers.type(
  //           inputAuthorizedAccount,
  //           utilsT.userData.username,
  //         );
  //         await userEventPendingTimers.click(submitButton);
  //       });
  //       await waitFor(() => {
  //         expect(screen.getByText(fakeData.messages.accountNoAuth)).toBeDefined();
  //       });
  //     });
  //     it('Must add account auth and navigate to settings main page', async () => {
  //       addByAuthButton = screen.getByLabelText(al.button.addByAuth);
  //       await act(async () => {
  //         await userEventPendingTimers.click(addByAuthButton);
  //       });
  //       HiveUtils.getClient().database.getAccounts = jest
  //         .fn()
  //         .mockResolvedValueOnce(fakeData.accounts.extendedAccountJustAuth)
  //         .mockResolvedValue(fakeData.accounts.extendedAccountFull);
  //       const inputUsername = screen.getByLabelText(al.input.username);
  //       const inputAuthorizedAccount = screen.getByLabelText(
  //         al.input.authorizedAccount,
  //       );
  //       const submitButton = screen.getByLabelText(al.button.submit);
  //       await act(async () => {
  //         await userEventPendingTimers.type(inputUsername, 'theghost1980');
  //         await userEventPendingTimers.type(
  //           inputAuthorizedAccount,
  //           utilsT.userData.username,
  //         );
  //         await userEventPendingTimers.click(submitButton);
  //       });
  //       await waitFor(() => {
  //         expect(
  //           screen.getByLabelText(al.component.settingsMainPage),
  //         ).toBeDefined();
  //       });
  //     });
  //   });
});

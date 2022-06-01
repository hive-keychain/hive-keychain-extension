import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { AutoLockType } from '@interfaces/autolock.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { SignInComponent } from '@popup/pages/sign-in/sign-in/sign-in.component';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import PopupUtils from 'src/utils/popup.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import RpcUtils from 'src/utils/rpc.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

const messagesJsonFile = require('public/_locales/en/messages.json');
const chrome = require('chrome-mock');
global.chrome = chrome;

afterEach(() => {
  jest.clearAllMocks();
});

////Important NOTES
/// - wrapper, app, then test the components.
/////

//to export to it own file
let fakeStore = getFakeStore(initialEmptyStateStore);
const wrapperStore = (component: JSX.Element): JSX.Element => {
  return <Provider store={fakeStore}>{component}</Provider>;
};
//end
describe('sign-in.component.tsx tests:\n', () => {
  const password = '12345678';
  const inputPasswordAL = 'password-input';
  test('should first', async () => {
    //mocks needed on component
    chrome.i18n.getMessage = jest.fn().mockImplementation((message) => {
      if (messagesJsonFile[message]) {
        return messagesJsonFile[message].message;
      }
      return message + ' check as not found on jsonFile.';
    });
    //end mocks
    //spies
    const spyMkUtilsLogin = jest
      .spyOn(MkUtils, 'login')
      .mockResolvedValueOnce(false);
    //end spies

    const utils = render(wrapperStore(<SignInComponent />));
    //utils.debug();
    const inputPasswordComponent = utils.getByLabelText(
      inputPasswordAL,
    ) as HTMLInputElement;
    //console.log(inputPasswordComponent);
    fireEvent.change(inputPasswordComponent, {
      target: { value: password },
    });
    expect(inputPasswordComponent.value).toBe(password);
    fireEvent.keyPress(inputPasswordComponent, {
      key: 'Enter',
      code: 13,
      charCode: 13,
    });
    expect(spyMkUtilsLogin).toBeCalledWith(password);
    await waitFor(() => {
      console.log(fakeStore.getState());
    });
  });

  test('constructing the app process to move into sign-in later', async () => {
    /////////new from here//////////
    //variables & consts
    const rpc = { uri: 'https://hived.privex.io/', testnet: false } as Rpc;
    const accounts = [
      utilsT.secondAccountOnState,
      {
        name: utilsT.userData.username,
        keys: utilsT.keysUserData1,
      },
    ] as LocalAccount[];
    const fakeExtendedAccountResponse = [
      {
        name: utilsT.userData.username,
        reputation: 100,
      },
    ];
    const fakeManaBarResponse = {
      current_mana: 1000,
      max_mana: 10000,
      percentage: 100,
    };
    const autoLock = {
      type: AutoLockType.DEFAULT,
      mn: 1,
    };
    //needed mocks for app and others
    chrome.i18n.getMessage = jest.fn().mockImplementation((message) => {
      if (messagesJsonFile[message]) {
        return messagesJsonFile[message].message;
      }
      return message + ' check as not found on jsonFile.';
    });
    //chrome.runtime.onMessage.addListener = jest.fn(); //no implementation
    //implementations
    const getValuefromLSImplementation = (...args: any[]) => {
      if (args[0] === LocalStorageKeyEnum.AUTOLOCK) {
        return autoLock;
      } else if (args[0] === LocalStorageKeyEnum.SWITCH_RPC_AUTO) {
        return true;
      }
    };
    //end implementations

    //add emptyInitialState to see how its behave
    fakeStore = getFakeStore({
      ...initialEmptyStateStore,
      accounts: accounts,
      activeAccount: {
        account: {
          name: utilsT.userData.username,
        } as ExtendedAccount,
        keys: utilsT.keysUserData1,
        rc: {} as Manabar,
      },
    });
    const wrapperStore: FC<{ children: React.ReactNode }> = ({ children }) => (
      <Provider store={fakeStore}>{children}</Provider>
    );
    // General App function calls & mocks for case 1: no mk but yes storedAccounts.
    // 1. PopupUtils.fixPopupOnMacOs(); tobe mocked(no impl) no need for now.
    const mockFixPopup = (PopupUtils.fixPopupOnMacOs = jest.fn()); //no implementation
    // 2. initAutoLock():
    //    - to mock: LocalStorageUtils.getValueFromLocalStorage => Autolock value
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation(getValuefromLSImplementation);
    //    - if autolock(of Autolock type):
    //      - will check on array
    //      - will send runtime message
    //    - else(autolock undefined):
    //      - will skip.
    // 3. initApplication():
    //    - to mock: RpcUtils.getCurrentRpc() => rpc
    const mGetCurrentRpc = (RpcUtils.getCurrentRpc = jest
      .fn()
      .mockResolvedValueOnce(rpc));
    //    - will setInitialRpc
    //    - this will trigger: onActiveRpcRefreshed()
    //        - onActiveRpcRefreshed():
    //          - if activeAccountUsername(comming from initialState):
    //            - will call refreshActiveAccount()
    //          - else
    //            - to mock ActiveAccountUtils.getActiveAccountNameFromLocalStorage()
    const mGetActiveAccount =
      (ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
        .fn()
        .mockResolvedValue(utilsT.userData.username));
    //        - it will dispatch: refreshKeys(account) & getAccountRC(account.name)
    //          - to mock HiveUtils.getClient().rc.getRCMana => fakeManaBar
    const mGetRCMana = (HiveUtils.getClient().rc.getRCMana = jest
      .fn()
      .mockResolvedValue(fakeManaBarResponse));
    //          - to mock HiveUtils.getClient().database.getAccounts
    HiveUtils.getClient().database.getAccounts = jest
      .fn()
      .mockResolvedValue(fakeExtendedAccountResponse);
    //        -  loadGlobalProperties();
    HiveUtils.getClient().database.getDynamicGlobalProperties = jest
      .fn()
      .mockResolvedValue(utilsT.dynamicPropertiesObj);
    HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
      .fn()
      .mockResolvedValue(utilsT.fakeCurrentMedianHistoryPrice);
    HiveUtils.getClient().database.call = jest
      .fn()
      .mockResolvedValue(utilsT.fakePostRewardFundResponse);
    //    - initActiveRpc:
    //      - to mock LocalStorageUtils.getValueFromLocalStorage => true
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation(getValuefromLSImplementation);

    //      - to mock RpcUtils.checkRpcStatus(rpc.uri) => true
    RpcUtils.checkRpcStatus = jest.fn().mockResolvedValue(true);
    //      - as is true, will setActiveRpc (dispatch)
    //        - to mock HiveUtils.setRpc(rpc) no need impl.
    HiveUtils.setRpc = jest.fn(); //no implementation for now as it will set the rpc
    //        - to mock chrome.runtime.sendMessage (may also be a spy to check if needed)
    chrome.runtime.sendMessage = jest.fn(); //no implementation
    //    - to mock AccountUtils.hasStoredAccounts() => true
    AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValue(true);
    //    - to mock MkUtils.getMkFromLocalStorage() => ''
    MkUtils.getMkFromLocalStorage = jest.fn().mockResolvedValue(''); //mk = ''
    //      - will setMk on state as ''.
    //    - to mock AccountUtils.getAccountsFromLocalStorage => [accounts]
    AccountUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue(accounts);
    //      - will setAccounts()
    //    - setAppReady(true);
    //    - will call selectComponent('', [accounts]);
    //for proposals
    ProposalUtils.hasVotedForProposal = jest.fn().mockResolvedValue(false);
    ProposalUtils.voteForKeychainProposal = jest.fn();
    // chrome.tabs.create => not imple.
    chrome.tabs.create = jest.fn(); //not implemented
    //
    ////until here all the setUp of app, mocks.

    //Notes for Cedric: onActiveRpcRefreshed is being called twice.

    //specific mocks & spies for this case
    const spyLogin = jest.spyOn(MkUtils, 'login').mockResolvedValueOnce(false);
    //end specific

    // const { debug, rerender } = render(<App />, { wrapper: wrapperStore});

    render(<App />, { wrapper: wrapperStore });
    await waitFor(() => {});
    const inputPasswordComponent = screen.getByLabelText(
      inputPasswordAL,
    ) as HTMLInputElement;
    expect(inputPasswordComponent).toBeDefined();
    fireEvent.change(inputPasswordComponent, {
      target: { value: 'invalid_password' },
    });
    expect(inputPasswordComponent.value).toBe('invalid_password');
    fireEvent.keyPress(inputPasswordComponent, {
      key: 'Enter',
      code: 13,
      charCode: 13,
    });
    await waitFor(async () => {
      expect(spyLogin).toBeCalledTimes(1);
      const errorMessage = await screen.findByText('Wrong password!');
      //console.log(errorMessage);
      expect(errorMessage).toBeDefined();
    });

    //debug();
    // await waitFor(() => {
    //   const inputPasswordComponent = screen.getByLabelText(
    //     inputPasswordAL,
    //   ) as HTMLInputElement;
    //   fireEvent.change(inputPasswordComponent, {
    //     target: { value: 'invalid_password' },
    //   });
    // });
    //debug();
    // await waitFor(async () => {
    //   const inputPasswordComponent = screen.getByLabelText(
    //     inputPasswordAL,
    //   ) as HTMLInputElement;
    //   fireEvent.keyPress(inputPasswordComponent, {
    //     key: 'Enter',
    //     code: 13,
    //     charCode: 13,
    //   });
    //   await waitFor(() => {
    //     expect(spyLogin).toBeCalledTimes(10);
    //   });
    //   //console.log(fakeStore.getState());
    // });
    // render(wrapperStore(<App />));
    // await waitFor(() => {
    //   const inputPasswordComponent = screen.getByLabelText(
    //     inputPasswordAL,
    //   ) as HTMLInputElement;
    //   expect(inputPasswordComponent).toBeDefined();
    //   //write password on input
    //   fireEvent.change(inputPasswordComponent, {
    //     target: { value: 'invalid_password' },
    //   });
    //   //check for value as set
    //   expect(inputPasswordComponent.value).toBe('invalid_password');
    // });
  });
});

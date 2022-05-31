import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { SignInComponent } from '@popup/pages/sign-in/sign-in/sign-in.component';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import PopupUtils from 'src/utils/popup.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import RpcUtils from 'src/utils/rpc.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import {
  getFakeStore,
  RootState,
} from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

const messagesJsonFile = require('public/_locales/en/messages.json');
const chrome = require('chrome-mock');
global.chrome = chrome;

afterEach(() => {
  jest.clearAllMocks();
});

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

  test('jkljkl', async () => {
    const initialStateWAccountsWActiveAccountStore = {
      accounts: [
        {
          name: utilsT.userData.username,
          keys: utilsT.keysUserData1,
        },
        utilsT.secondAccountOnState,
      ],
      activeAccount: {
        name: utilsT.userData.username,
        account: {
          name: utilsT.userData.username,
          //reward_vesting_balance: '1000 VESTS',
        },
        keys: utilsT.keysUserData1,
        rc: {},
      },
    } as RootState;
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
    //set state as initialStateWAccountsWActiveAccountStore
    fakeStore = getFakeStore(initialEmptyStateStore);
    //App settings
    const rpc = { uri: 'https://hived.privex.io/', testnet: false } as Rpc;
    const accounts = [
      utilsT.secondAccountOnState,
      {
        name: utilsT.userData.username,
        keys: utilsT.keysUserData1,
      },
    ] as LocalAccount[];

    chrome.i18n.getMessage = jest.fn().mockImplementation((message) => {
      if (messagesJsonFile[message]) {
        return messagesJsonFile[message].message;
      }
      return message + ' check as not found on jsonFile.';
    });
    PopupUtils.fixPopupOnMacOs = jest.fn(); //no implementation
    LocalStorageUtils.getValueFromLocalStorage = jest.fn(); //no implementation
    chrome.runtime.onMessage.addListener = jest.fn(); //no implementation
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValueOnce(rpc);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValueOnce(true); //switchAuto -> setActiveRpc
    RpcUtils.checkRpcStatus = jest.fn().mockResolvedValueOnce(true); //rpcStatusOk
    ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
      .fn()
      .mockResolvedValueOnce(utilsT.userData.username);
    HiveUtils.getClient().database.getDynamicGlobalProperties = jest
      .fn()
      .mockResolvedValueOnce(utilsT.dynamicPropertiesObj);
    HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
      .fn()
      .mockResolvedValueOnce(utilsT.fakeCurrentMedianHistoryPrice);
    HiveUtils.getClient().database.call = jest
      .fn()
      .mockResolvedValueOnce(utilsT.fakePostRewardFundResponse);
    HiveUtils.getClient().database.getAccounts = jest
      .fn()
      .mockResolvedValueOnce(fakeExtendedAccountResponse);
    HiveUtils.getClient().rc.getRCMana = jest
      .fn()
      .mockResolvedValueOnce(fakeManaBarResponse);
    ActiveAccountUtils.hasReward = jest.fn().mockReturnValueOnce(false);
    CurrencyUtils.getCurrencyLabels = jest.fn().mockReturnValueOnce({
      hive: 'HIVE',
      hbd: 'HBD',
      hp: 'HP',
    });

    //as case 1 false
    AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValueOnce(false);
    MkUtils.getMkFromLocalStorage = jest
      .fn()
      .mockResolvedValueOnce(utilsT.secondAccountOnState.name);
    FormatUtils.toHP = jest.fn(); //no implementation
    ProposalUtils.hasVotedForProposal = jest.fn().mockResolvedValueOnce(true);

    //as case 1 has accounts stored
    AccountUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValueOnce(accounts);
    //End App settings

    // const { debug } = render(wrapperStore(<App />));
    // await waitFor(() => debug());

    render(wrapperStore(<App />));
    await waitFor(() => {
      const buttons = screen.getAllByRole('div');
      console.log(buttons);
      console.log(fakeStore.getState());
    });
  });
});

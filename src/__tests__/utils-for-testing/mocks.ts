import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { AutoLockType } from '@interfaces/autolock.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import PopupUtils from 'src/utils/popup.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import RpcUtils from 'src/utils/rpc.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
const messagesJsonFile = require('public/_locales/en/messages.json');

const getValuefromLS = (...args: any[]) => {
  if (args[0] === LocalStorageKeyEnum.AUTOLOCK) {
    return {
      type: AutoLockType.DEFAULT,
      mn: 1,
    };
  } else if (args[0] === LocalStorageKeyEnum.SWITCH_RPC_AUTO) {
    return true;
  }
};

const i18nGetMessage = (message: string) => {
  //console.log('message input: ', message);
  if (messagesJsonFile[message]) {
    return messagesJsonFile[message].message;
  }
  return message + ' check as not found on jsonFile.';
};

const mocksApp = (
  fixPopupOnMacOsImplementation: any, //how to restrict it to a jest function only?
  getValuefromLSImplementation: any,
  rpc: Rpc,
  activeAccountUsername: string,
  fakeManaBarResponse: Manabar,
  fakeExtendedAccountResponse: any[],
  rpcStatus: boolean,
  setRpcImplementation: any,
  runtimeSendMessageImplementation: any,
  hasStoredAccountsResolvedValue: boolean,
  getMkFromLSResolvedValue: string,
  accountsFromLocalStorageResolvedValue: LocalAccount[],
  hasVotedForProposalResolvedValue: boolean,
  voteForKeychainProposalImplementation: any,
  chromeTabsCreateImplementation: any,
  chromei18nGetMessageImplementation: any,
) => {
  PopupUtils.fixPopupOnMacOs = fixPopupOnMacOsImplementation;
  LocalStorageUtils.getValueFromLocalStorage = jest
    .fn()
    .mockImplementation(getValuefromLSImplementation);
  RpcUtils.getCurrentRpc = jest.fn().mockResolvedValue(rpc);
  ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
    .fn()
    .mockResolvedValue(activeAccountUsername);
  HiveUtils.getClient().rc.getRCMana = jest
    .fn()
    .mockResolvedValue(fakeManaBarResponse);
  HiveUtils.getClient().database.getAccounts = jest
    .fn()
    .mockResolvedValue(fakeExtendedAccountResponse);
  HiveUtils.getClient().database.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(utilsT.dynamicPropertiesObj);
  HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(utilsT.fakeCurrentMedianHistoryPrice);
  HiveUtils.getClient().database.call = jest
    .fn()
    .mockResolvedValue(utilsT.fakePostRewardFundResponse);
  RpcUtils.checkRpcStatus = jest.fn().mockResolvedValue(rpcStatus);
  HiveUtils.setRpc = setRpcImplementation; //no implementation for now as it will set the rpc anyway
  chrome.runtime.sendMessage = runtimeSendMessageImplementation; //no implementation
  AccountUtils.hasStoredAccounts = jest
    .fn()
    .mockResolvedValue(hasStoredAccountsResolvedValue);
  MkUtils.getMkFromLocalStorage = jest
    .fn()
    .mockResolvedValue(getMkFromLSResolvedValue); //mk = ''
  AccountUtils.getAccountsFromLocalStorage = jest
    .fn()
    .mockResolvedValue(accountsFromLocalStorageResolvedValue);
  ProposalUtils.hasVotedForProposal = jest
    .fn()
    .mockResolvedValue(hasVotedForProposalResolvedValue);
  ProposalUtils.voteForKeychainProposal = voteForKeychainProposalImplementation;
  chrome.tabs.create = chromeTabsCreateImplementation; //not implementation
  chrome.i18n.getMessage = chromei18nGetMessageImplementation;
};

const mocksHome = (
  getPricesResolvedValue: { data: {} },
  getAccountValueReturnValue: string,
) => {
  CurrencyPricesUtils.getPrices = jest
    .fn()
    .mockResolvedValue(getPricesResolvedValue);
  AccountUtils.getAccountValue = jest
    .fn()
    .mockReturnValue(getAccountValueReturnValue);
};

const mocksTopBar = (hasRewardReturnedValue: boolean) => {
  ActiveAccountUtils.hasReward = jest
    .fn()
    .mockReturnValue(hasRewardReturnedValue);
};

const implementation = {
  getValuefromLS,
  i18nGetMessage,
};

const mocks = {
  mocksApp,
  mocksHome,
  mocksTopBar,
};
const customMocks = {
  implementation,
  mocks,
};
export default customMocks;

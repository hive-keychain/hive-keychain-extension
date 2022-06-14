import { ExtendedAccount } from '@hiveio/dhive';
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

//TODO is it possible to try the following:
// add default values and parameters as parameter?
// so they won't be needed all the time but rather use a default value
// so the final call will be smaller, even with a predefined values.

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
  const messagesJsonFile = require('public/_locales/en/messages.json');
  if (messagesJsonFile[message]) {
    return messagesJsonFile[message].message;
  }
  return message + ' check as not found on jsonFile.';
};

const mocksTopBar = (toUse: { hasReward: boolean }) => {
  ActiveAccountUtils.hasReward = jest.fn().mockReturnValue(toUse.hasReward);
};

const mocksHome = (toUse: {
  getPrices: { data: {} };
  getAccountValue: string;
}) => {
  CurrencyPricesUtils.getPrices = jest.fn().mockResolvedValue(toUse.getPrices);
  AccountUtils.getAccountValue = jest
    .fn()
    .mockReturnValue(toUse.getAccountValue);
};

const mocksApp = (toUse: {
  fixPopupOnMacOs: jest.Mock;
  getValueFromLocalStorage: jest.Mock;
  getCurrentRpc: Rpc;
  activeAccountUsername: string;
  getRCMana: Manabar;
  getAccounts: ExtendedAccount[];
  rpcStatus: boolean;
  setRpc: jest.Mock;
  chromeSendMessage: jest.Mock;
  hasStoredAccounts: boolean;
  mkLocal: string;
  getAccountsFromLocalStorage: LocalAccount[];
  hasVotedForProposal: boolean;
  voteForKeychainProposal: jest.Mock;
  chromeTabsCreate: jest.Mock;
  i18nGetMessage: jest.Mock;
  saveValueInLocalStorage: jest.Mock;
  clearLocalStorage: jest.Mock;
  removeFromLocalStorage: jest.Mock;
}) => {
  PopupUtils.fixPopupOnMacOs = toUse.fixPopupOnMacOs;
  LocalStorageUtils.getValueFromLocalStorage = toUse.getValueFromLocalStorage;
  RpcUtils.getCurrentRpc = jest.fn().mockResolvedValue(toUse.getCurrentRpc);
  ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
    .fn()
    .mockResolvedValue(toUse.activeAccountUsername);
  HiveUtils.getClient().rc.getRCMana = jest
    .fn()
    .mockResolvedValue(toUse.getRCMana);
  HiveUtils.getClient().database.getAccounts = jest
    .fn()
    .mockResolvedValue(toUse.getAccounts);
  HiveUtils.getClient().database.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(utilsT.dynamicPropertiesObj);
  HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(utilsT.fakeCurrentMedianHistoryPrice);
  HiveUtils.getClient().database.call = jest
    .fn()
    .mockResolvedValue(utilsT.fakePostRewardFundResponse);
  RpcUtils.checkRpcStatus = jest.fn().mockResolvedValue(toUse.rpcStatus);
  HiveUtils.setRpc = toUse.setRpc;
  chrome.runtime.sendMessage = toUse.chromeSendMessage;
  AccountUtils.hasStoredAccounts = jest
    .fn()
    .mockResolvedValue(toUse.hasStoredAccounts);
  MkUtils.getMkFromLocalStorage = jest.fn().mockResolvedValue(toUse.mkLocal);
  AccountUtils.getAccountsFromLocalStorage = jest
    .fn()
    .mockResolvedValue(toUse.getAccountsFromLocalStorage);
  ProposalUtils.hasVotedForProposal = jest
    .fn()
    .mockResolvedValue(toUse.hasVotedForProposal);
  ProposalUtils.voteForKeychainProposal = toUse.voteForKeychainProposal;
  chrome.tabs.create = toUse.chromeTabsCreate;
  chrome.i18n.getMessage = toUse.i18nGetMessage;
  LocalStorageUtils.saveValueInLocalStorage = toUse.saveValueInLocalStorage;
  chrome.storage.local.clear = toUse.clearLocalStorage;
  LocalStorageUtils.removeFromLocalStorage = toUse.removeFromLocalStorage;
};

const mocks = {
  mocksApp,
  mocksHome,
  mocksTopBar,
  getValuefromLS,
  i18nGetMessage,
};

export default mocks;

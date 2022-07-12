import LocalStorageUtils from 'src/utils/localStorage.utils';
import PopupUtils from 'src/utils/popup.utils';

const noImplentationNeeded = () => {
  LocalStorageUtils.saveValueInLocalStorage = jest.fn();
  LocalStorageUtils.removeFromLocalStorage = jest.fn();
  chrome.runtime.sendMessage = jest.fn();
  PopupUtils.fixPopupOnMacOs = jest.fn();
  chrome.tabs.create = jest.fn();
  chrome.storage.local.clear = jest.fn();
};

const initialMocks = {
  noImplentationNeeded,
};

export default initialMocks;

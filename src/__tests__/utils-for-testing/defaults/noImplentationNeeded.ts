import LocalStorageUtils from 'src/utils/localStorage.utils';
import PopupUtils from 'src/utils/popup.utils';

const noImplentationNeeded = () => {
  chrome.runtime.sendMessage = jest.fn(); //no impl
  PopupUtils.fixPopupOnMacOs = jest.fn(); //no impl
  chrome.tabs.create = jest.fn(); //no impl
  LocalStorageUtils.saveValueInLocalStorage = jest.fn(); //no impl
  chrome.storage.local.clear = jest.fn(); //no impl
  LocalStorageUtils.removeFromLocalStorage = jest.fn(); //no impl
};

const initialMocks = {
  noImplentationNeeded,
};

export default initialMocks;

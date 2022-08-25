import { act } from '@testing-library/react';
import { chrome } from 'jest-chrome';

const callListeners = async (data: {}, sendResponse?: any) => {
  const cb = () => {};
  act(() => {
    chrome.runtime.onMessage.callListeners(
      data, // message
      {}, // MessageSender object
      sendResponse ?? cb, // SendResponse function
    );
  });
};

export default callListeners;

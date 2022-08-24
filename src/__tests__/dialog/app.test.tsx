import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { act, render, screen } from '@testing-library/react';
import { chrome } from 'jest-chrome';
import React from 'react';
import App from 'src/dialog/App';
describe('dialog app tests:\n', () => {
  it('Must render app with no data', async () => {
    const data = {
      command: DialogCommand.UNLOCK,
      msg: {
        success: false,
        error: 'locked',
        result: null,
        data: {},
        message: await chrome.i18n.getMessage('bgd_auth_locked'),
        display_msg: await chrome.i18n.getMessage('bgd_auth_locked_desc'),
      },
      tab: 0,
      domain: 'domain',
    };
    render(<App />);
    act(() => {
      chrome.runtime.onMessage.callListeners(
        data, // message
        {}, // MessageSender object
        () => {}, // SendResponse function
      );
    });
    screen.debug();
  });
});

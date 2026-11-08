import '@testing-library/jest-dom';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Unlock from 'src/dialog/multichain/unlock/unlock';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import LegalDocumentsUtils from 'src/utils/legal-documents.utils';
import VaultUtils from 'src/utils/vault.utils';

jest.mock('src/utils/communication.utils', () => ({
  CommunicationUtils: {
    runtimeSendMessage: jest.fn(),
  },
}));

jest.mock('src/utils/legal-documents.utils', () => ({
  __esModule: true,
  default: {
    needsLegalDocumentAcceptance: jest.fn().mockResolvedValue(false),
    acceptLegalDocumentHashes: jest.fn().mockResolvedValue(undefined),
  },
}));

const getUnlockData = (command: DialogCommand) => ({
  command,
  msg: {
    success: false,
    error: 'locked',
    result: null,
    data: { request_id: 42 },
    message: 'locked',
    display_msg: 'unlock',
  },
  tab: 7,
  domain: 'example.com',
});

describe('Unlock dialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (LegalDocumentsUtils.needsLegalDocumentAcceptance as jest.Mock).mockResolvedValue(
      false,
    );
    (
      LegalDocumentsUtils.acceptLegalDocumentHashes as jest.Mock
    ).mockResolvedValue(undefined);
    chrome.runtime.onMessage.addListener = jest.fn();
    chrome.runtime.onMessage.removeListener = jest.fn();
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([DialogCommand.UNLOCK, DialogCommand.UNLOCK_EVM])(
    'continues a %s request when another extension surface unlocks the wallet',
    async (command) => {
      const data = getUnlockData(command);
      jest
        .spyOn(VaultUtils, 'getValueFromVault')
        .mockResolvedValue('popup-mk');
      render(<Unlock data={data as any} />);

      const walletLockStateListener = (
        chrome.runtime.onMessage.addListener as jest.Mock
      ).mock.calls[0][0];
      await act(async () => {
        walletLockStateListener({
          command: BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED,
        });
        walletLockStateListener({
          command: BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED,
        });
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith({
          command: BackgroundCommand.UNLOCK_FROM_DIALOG,
          value: {
            data,
            tab: 7,
            mk: 'popup-mk',
            domain: 'example.com',
            request_id: 42,
          },
        });
      });
      expect(VaultUtils.getValueFromVault).toHaveBeenCalledTimes(1);
      expect(VaultUtils.getValueFromVault).toHaveBeenCalledWith(VaultKey.__MK);
    },
  );

  it('does not continue when the vault is still locked', async () => {
    render(<Unlock data={getUnlockData(DialogCommand.UNLOCK) as any} />);

    const walletLockStateListener = (
      chrome.runtime.onMessage.addListener as jest.Mock
    ).mock.calls[0][0];
    await act(async () => {
      walletLockStateListener({
        command: BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED,
      });
      await Promise.resolve();
    });

    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
  });

  it('ignores vault notifications while its own unlock is pending', async () => {
    render(<Unlock data={getUnlockData(DialogCommand.UNLOCK) as any} />);

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'dialog-mk' },
    });
    fireEvent.click(screen.getByText('Unlock'));

    const walletLockStateListener = (
      chrome.runtime.onMessage.addListener as jest.Mock
    ).mock.calls[0][0];
    walletLockStateListener({
      command: BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED,
    });

    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledTimes(1);
    expect(VaultUtils.getValueFromVault).not.toHaveBeenCalled();
  });

  it('ignores unrelated messages and removes the listener on unmount', () => {
    const { unmount } = render(
      <Unlock data={getUnlockData(DialogCommand.UNLOCK) as any} />,
    );

    const walletLockStateListener = (
      chrome.runtime.onMessage.addListener as jest.Mock
    ).mock.calls[0][0];
    walletLockStateListener({ command: BackgroundCommand.PING });
    expect(VaultUtils.getValueFromVault).not.toHaveBeenCalled();

    unmount();
    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(
      walletLockStateListener,
    );
  });

  it('does not show the terms checkbox when the legal documents are unchanged', async () => {
    render(<Unlock data={getUnlockData(DialogCommand.UNLOCK) as any} />);

    await waitFor(() => {
      expect(LegalDocumentsUtils.needsLegalDocumentAcceptance).toHaveBeenCalled();
    });
    expect(
      screen.queryByTestId('accept-terms-and-condition'),
    ).not.toBeInTheDocument();
  });

  it('blocks unlock until the updated terms are accepted', async () => {
    (LegalDocumentsUtils.needsLegalDocumentAcceptance as jest.Mock).mockResolvedValue(
      true,
    );
    render(<Unlock data={getUnlockData(DialogCommand.UNLOCK) as any} />);

    expect(
      await screen.findByTestId('accept-terms-and-condition'),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'dialog-mk' },
    });
    fireEvent.click(screen.getByText('Unlock'));

    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
    expect(LegalDocumentsUtils.acceptLegalDocumentHashes).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        I18nUtils.getMessage('html_popup_sign_up_need_accept_pp'),
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Unlock'));

    expect(LegalDocumentsUtils.acceptLegalDocumentHashes).toHaveBeenCalledTimes(
      1,
    );
    expect(CommunicationUtils.runtimeSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        command: BackgroundCommand.UNLOCK_FROM_DIALOG,
        value: expect.objectContaining({ mk: 'dialog-mk' }),
      }),
    );
  });

  it('does not continue a vault unlock until the updated terms are accepted', async () => {
    (LegalDocumentsUtils.needsLegalDocumentAcceptance as jest.Mock).mockResolvedValue(
      true,
    );
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue('popup-mk');
    render(<Unlock data={getUnlockData(DialogCommand.UNLOCK) as any} />);
    await screen.findByTestId('accept-terms-and-condition');

    const walletLockStateListener = (
      chrome.runtime.onMessage.addListener as jest.Mock
    ).mock.calls[0][0];
    await act(async () => {
      walletLockStateListener({
        command: BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED,
      });
      await Promise.resolve();
    });

    expect(CommunicationUtils.runtimeSendMessage).not.toHaveBeenCalled();
    expect(LegalDocumentsUtils.acceptLegalDocumentHashes).not.toHaveBeenCalled();
  });
});

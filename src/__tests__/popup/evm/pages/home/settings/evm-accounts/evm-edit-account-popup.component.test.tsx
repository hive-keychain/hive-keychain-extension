import '@testing-library/jest-dom';
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EvmEditAccountPopup } from 'src/popup/evm/pages/home/settings/evm-accounts/evm-edit-account-popup/evm-edit-account-popup.component';
import Logger from 'src/utils/logger.utils';

describe('EvmEditAccountPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger, 'error').mockImplementation();
  });

  it('prevents duplicate submissions and allows retrying after a save failure', async () => {
    const user = userEvent.setup();
    const saveError = new Error('Storage unavailable');
    let rejectSave: (reason: Error) => void = () => undefined;
    const onSubmit = jest.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectSave = reject;
        }),
    );

    render(
      <EvmEditAccountPopup
        editParams={{
          initialValue: 'Account 1',
          onSubmit,
          onCancel: jest.fn(),
          title: 'evm_edit_address_name',
        }}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    await user.click(confirmButton);
    await user.click(confirmButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(confirmButton).toBeDisabled();

    await act(async () => {
      rejectSave(saveError);
    });

    expect(
      screen.getByText('Something went wrong! Please try again!'),
    ).toBeInTheDocument();
    expect(confirmButton).toBeEnabled();
    expect(Logger.error).toHaveBeenCalledWith(
      'Unable to save EVM account changes',
      saveError,
    );
  });
});

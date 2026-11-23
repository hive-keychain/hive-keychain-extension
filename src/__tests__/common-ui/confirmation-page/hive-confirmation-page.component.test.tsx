import { ActiveAccount } from '@interfaces/active-account.interface';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { HiveConfirmationPageContent } from 'src/common-ui/confirmation-page/hive-confirmation-page.component';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('HiveConfirmationPageContent', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('shows immediate feedback while confirmation is pending', async () => {
    const afterConfirmAction = jest.fn(
      () => new Promise<void>(() => undefined),
    );

    render(
      <HiveConfirmationPageContent
        embedded
        fields={[]}
        message="Confirm"
        title="portfolio"
        method={null}
        activeAccount={{} as ActiveAccount}
        tokens={[]}
        afterConfirmAction={afterConfirmAction}
      />,
    );

    fireEvent.click(screen.getByTestId('dialog_confirm-button'));

    await waitFor(() => {
      expect(afterConfirmAction).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('dialog_confirm-button')).toBeDisabled();
    });
    expect(screen.getByTestId('dialog_confirm-button')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByTestId('dialog_confirm-button')).not.toHaveClass(
      'disabled',
    );
    expect(
      screen
        .getByTestId('dialog_confirm-button')
        .querySelector('.button-loading-spinner'),
    ).not.toBeNull();
    expect(screen.getByTestId('dialog_cancel-button')).toBeDisabled();
  });
});

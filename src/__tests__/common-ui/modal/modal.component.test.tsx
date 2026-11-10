import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { ModalPresentation } from 'src/common-ui/modal/modal.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => null,
}));

const ModalHost = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open modal
      </button>
      {isOpen && (
        <ModalPresentation
          title="test_modal_title"
          showCloseButton
          onClose={() => setIsOpen(false)}>
          <input aria-label="Modal input" />
          <button type="button">Last action</button>
        </ModalPresentation>
      )}
    </>
  );
};

describe('ModalPresentation', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('contains focus and restores it after Escape closes the modal', async () => {
    const user = userEvent.setup();
    render(<ModalHost />);

    const trigger = screen.getByRole('button', { name: 'Open modal' });
    await user.click(trigger);

    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'test_modal_title',
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Modal input' })).toHaveFocus(),
    );

    screen.getByRole('button', { name: 'Last action' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'popup_html_close' })).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close an explicitly non-dismissible modal with Escape', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <ModalPresentation
        title="test_modal_title"
        closeOnOverlayClick={false}
        showCloseButton={false}
        onClose={onClose}>
        <button type="button">Continue</button>
      </ModalPresentation>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus(),
    );
    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

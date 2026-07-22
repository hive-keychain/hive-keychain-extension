import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';

const PopupHost = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open popup
      </button>
      {isOpen && (
        <PopupContainer
          aria-label="Test popup"
          onClickOutside={() => setIsOpen(false)}>
          <input aria-label="Popup input" />
          <button type="button">Last action</button>
        </PopupContainer>
      )}
    </>
  );
};

describe('PopupContainer', () => {
  it('contains focus and restores it when Escape closes the popup', async () => {
    const user = userEvent.setup();
    render(<PopupHost />);

    const trigger = screen.getByRole('button', { name: 'Open popup' });
    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Test popup' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Popup input' })).toHaveFocus(),
    );

    screen.getByRole('button', { name: 'Last action' }).focus();
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Popup input' })).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

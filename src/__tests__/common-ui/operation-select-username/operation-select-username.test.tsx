import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import OperationSelectUsername from 'src/common-ui/operation-select-username/operation-select-username';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/preloaded-image/preloaded-image.component', () => ({
  PreloadedImage: () => null,
}));

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => null,
}));

describe('OperationSelectUsername', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('selects an account with arrow keys and Enter', async () => {
    const user = userEvent.setup();
    const setUsername = jest.fn();
    render(
      <OperationSelectUsername
        accounts={['alice', 'bob']}
        username="alice"
        setUsername={setUsername}
        label="popup_html_username"
      />,
    );

    const select = screen.getByRole('combobox', {
      name: 'popup_html_username',
    });
    select.focus();
    await user.keyboard('{Enter}{ArrowDown}{Enter}');

    expect(setUsername).toHaveBeenCalledWith('bob');
    expect(select).toHaveAttribute('aria-expanded', 'false');
    expect(select).toHaveFocus();
  });

  it('closes with Escape without changing the account', async () => {
    const user = userEvent.setup();
    const setUsername = jest.fn();
    render(
      <OperationSelectUsername
        accounts={['alice', 'bob']}
        username="alice"
        setUsername={setUsername}
      />,
    );

    const select = screen.getByRole('combobox', {
      name: 'popup_html_username',
    });
    select.focus();
    await user.keyboard(' {ArrowDown}{Escape}');

    expect(setUsername).not.toHaveBeenCalled();
    expect(select).toHaveAttribute('aria-expanded', 'false');
    expect(select).toHaveFocus();
  });
});

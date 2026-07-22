import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AddContactButton } from 'src/common-ui/contacts/add-contact-button/add-contact-button.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span aria-hidden="true" />,
}));

describe('AddContactButton', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('activates from Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<AddContactButton onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'evm_addresses_add' });
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

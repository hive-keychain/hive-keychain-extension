import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { EvmRequestItemLongText } from 'src/dialog/evm/components/evm-request-item/evm-request-item-long-text/evm-request-item-long-text';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span aria-hidden="true" />,
}));

jest.mock('src/dialog/evm/components/use-field-title.hook', () => ({
  useFieldTitle: (title?: string) => title,
}));

describe('EvmRequestItemLongText', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('expands and collapses titled content from the keyboard', async () => {
    const user = userEvent.setup();
    render(<EvmRequestItemLongText title="Data" value="Long value" />);

    const disclosure = screen.getByRole('button', { name: 'Data' });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');

    disclosure.focus();
    await user.keyboard('{Enter}');
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Long value')).toBeVisible();

    await user.keyboard(' ');
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Long value')).not.toBeInTheDocument();
  });

  it('labels a value-only disclosure', () => {
    render(<EvmRequestItemLongText value="Long value" />);

    expect(
      screen.getByRole('button', {
        name: 'evm_security_warning_show_details',
      }),
    ).toBeInTheDocument();
  });
});

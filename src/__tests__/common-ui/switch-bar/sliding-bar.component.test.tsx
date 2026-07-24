import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';
import { I18nUtils } from 'src/utils/i18n.utils';

const SlidingBarHost = () => {
  const [selectedValue, setSelectedValue] = useState('tokens');

  return (
    <SlidingBarComponent
      id="wallet-tabs"
      selectedValue={selectedValue}
      onChange={setSelectedValue}
      values={[
        { value: 'tokens', label: 'evm_tab_tokens' },
        { value: 'nfts', label: 'evm_tab_nfts' },
        { value: 'history', label: 'evm_tab_history' },
      ]}
    />
  );
};

describe('SlidingBarComponent', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('changes the selected option with arrow keys', async () => {
    const user = userEvent.setup();
    render(<SlidingBarHost />);

    const tokens = screen.getByRole('radio', { name: 'evm_tab_tokens' });
    const nfts = screen.getByRole('radio', { name: 'evm_tab_nfts' });
    const history = screen.getByRole('radio', { name: 'evm_tab_history' });

    expect(tokens).toBeChecked();
    tokens.focus();
    await user.keyboard('{ArrowRight}');
    expect(nfts).toBeChecked();
    await user.keyboard('{ArrowRight}');
    expect(history).toBeChecked();
    await user.keyboard('{ArrowLeft}');
    expect(nfts).toBeChecked();
  });
});

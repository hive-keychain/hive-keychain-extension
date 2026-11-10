import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  EvmAccountPublic,
  EvmAccountSource,
} from 'src/popup/evm/interfaces/wallet.interface';
import { EvmAccountInfo } from 'src/common-ui/evm/evm-account-display/evm-account-info.component';

describe('EvmAccountInfo', () => {
  it('does not render the Ledger source badge', () => {
    const account: EvmAccountPublic = {
      id: 0,
      path: "m/44'/60'/0'/0/0",
      address: '0x1234567890123456789012345678901234567890',
      seedId: 1,
      source: EvmAccountSource.LEDGER,
    };

    render(<EvmAccountInfo account={account} fullAddress />);

    expect(
      screen.getByText('0x1234567890123456789012345678901234567890'),
    ).toBeInTheDocument();
    expect(screen.queryByText('html_popup_using_ledger')).not.toBeInTheDocument();
  });
});

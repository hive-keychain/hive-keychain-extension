import '@testing-library/jest-dom';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { SwitchChain } from '@dialog/evm/requests/switch-chain/switch-chain';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

jest.mock('src/dialog/evm/evm-operation/evm-operation', () => ({
  EvmOperation: ({ title, caption, fields }: any) => (
    <div data-testid="evm-operation">
      <div>{title}</div>
      <div>{caption}</div>
      {fields}
    </div>
  ),
}));

jest.mock('src/common-ui/chain-logo/chain-logo.component', () => ({
  ChainLogo: ({ chainName }: any) => (
    <div data-testid="chain-logo">{chainName}</div>
  ),
}));

const request = {
  request_id: 7,
  method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
  params: [{ chainId: '0x539' }],
  chainId: '0x1',
} as any;

const data = {
  tab: 12,
  dappInfo: {
    origin: 'https://example.app',
    domain: 'example.app',
  },
  accounts: [],
} as any;

describe('SwitchChain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.chrome.i18n.getMessage = jest.fn(
      (key: string, params?: string[]) =>
        params?.length ? `${key}:${params.join(',')}` : key,
    );
    jest.spyOn(ChainUtils, 'getChain').mockResolvedValue({
      chainId: '0x539',
      name: 'Local Custom Chain',
      logo: 'https://example.app/chain.png',
    } as any);
  });

  it('renders the requested chain details for the dapp', async () => {
    render(
      <SwitchChain request={request} data={data} afterCancel={jest.fn()} />,
    );

    expect(screen.getByText('evm_switch_chain')).toBeInTheDocument();
    expect(
      screen.getByText('evm_switch_chain_caption:example.app'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('Local Custom Chain')).toHaveLength(2);
    });
    expect(screen.getByText('0x539')).toBeInTheDocument();
    expect(screen.getByTestId('chain-logo')).toHaveTextContent(
      'Local Custom Chain',
    );
  });
});

import {
  DAppCategory,
  EcosystemCategory,
} from '@popup/hive/pages/app-container/home/ecosystem/ecosystem-category/ecosystem-category.component';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

describe('EcosystemCategory', () => {
  const buildCategory = (dapps: DAppCategory['dapps']): DAppCategory => ({
    category: 'finance',
    dapps,
  });

  beforeEach(() => {
    chrome.tabs.create = jest.fn() as any;
  });

  it('renders the dapp logo and the chain badge when chainLogo is provided', async () => {
    render(
      <EcosystemCategory
        category={buildCategory([
          {
            id: 1,
            name: 'Swap App',
            description: 'desc',
            icon: 'https://example.com/dapp.png',
            chainId: '0x1',
            chainLogo: 'https://example.com/chain.png',
            url: 'https://example.com',
            categories: ['finance'],
            order: 1,
          },
        ])}
      />,
    );

    expect(screen.getByAltText('Swap App').getAttribute('src')).toBe(
      'https://example.com/dapp.png',
    );
    expect(screen.getByAltText('Swap App chain logo').getAttribute('src')).toBe(
      'https://example.com/chain.png',
    );
  });

  it('omits the chain badge when chainLogo is absent', async () => {
    render(
      <EcosystemCategory
        category={buildCategory([
          {
            id: 1,
            name: 'Swap App',
            description: 'desc',
            icon: 'https://example.com/dapp.png',
            url: 'https://example.com',
            categories: ['finance'],
            order: 1,
          },
        ])}
      />,
    );

    expect(screen.getByAltText('Swap App').getAttribute('src')).toBe(
      'https://example.com/dapp.png',
    );
    expect(screen.queryByAltText('Swap App chain logo')).toBeNull();
  });

  it('opens the dapp url when the card is clicked', async () => {
    render(
      <EcosystemCategory
        category={buildCategory([
          {
            id: 1,
            name: 'Swap App',
            description: 'desc',
            icon: 'https://example.com/dapp.png',
            chainLogo: 'https://example.com/chain.png',
            url: 'https://example.com',
            categories: ['finance'],
            order: 1,
          },
        ])}
      />,
    );

    await userEvent.click(screen.getByText('Swap App'));

    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://example.com',
    });
  });
});

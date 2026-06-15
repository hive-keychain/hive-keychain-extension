import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Portfolio } from 'src/portfolio/portfolio.component';
import { PortfolioApiUtils } from 'src/portfolio/portfolio-api.utils';

jest.mock('src/portfolio/portfolio-api.utils', () => ({
  PortfolioApiUtils: {
    listAssets: jest.fn().mockResolvedValue([]),
  },
}));

describe('Portfolio', () => {
  it('renders the portfolio shell and navigates between sections', async () => {
    const setTitleContainerProperties = jest.fn();
    const { container, getByTestId } = render(
      <Portfolio
        hiveAccounts={[]}
        evmAccounts={[]}
        activeAccountType={ChainType.HIVE}
        activeEvmAccountAddress={undefined}
        activeHiveAccountName={undefined}
        navigateTo={jest.fn()}
        navigateToWithParams={jest.fn()}
        setErrorMessage={jest.fn()}
        setTitleContainerProperties={setTitleContainerProperties}
      />,
    );

    await waitFor(() => expect(PortfolioApiUtils.listAssets).toHaveBeenCalled());

    expect(getByTestId('portfolio-page')).toBeTruthy();
    expect(container.querySelector('.portfolio-app-shell')).not.toBeNull();
    expect(container.querySelector('.portfolio-sidebar')).not.toBeNull();
    expect(setTitleContainerProperties).toHaveBeenCalledWith({
      title: '',
      isCloseButtonDisabled: true,
    });

    const sidebarButtons = container.querySelectorAll('.portfolio-sidebar nav button');
    expect(sidebarButtons).toHaveLength(6);
    expect(sidebarButtons[0].classList.contains('active')).toBe(true);

    fireEvent.click(sidebarButtons[3]);

    expect(sidebarButtons[3].classList.contains('active')).toBe(true);
    expect(container.querySelector('.portfolio-flow')).not.toBeNull();
  });
});

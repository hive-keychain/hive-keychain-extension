import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TopBarComponent } from 'src/common-ui/_containers/top-bar/top-bar.component';

jest.mock('src/common-ui/chain-dropdown/chain-dropdown.component', () => ({
  ChainDropdownComponent: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'chain-dropdown' });
  },
}));

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ className, dataTestId }: any) => {
    const React = require('react');
    return React.createElement('div', {
      className,
      'data-testid': dataTestId,
    });
  },
}));

describe('TopBarComponent', () => {
  const renderTopBar = (actions?: React.ReactNode) => {
    return render(
      <TopBarComponent
        accountSelector={<div data-testid="account-selector" />}
        actions={actions}
        onMenuButtonClicked={async () => undefined}
        onRefreshButtonClicked={async () => undefined}
      />,
    );
  };

  it('does not render the actions panel when no actions are provided', () => {
    const { container } = renderTopBar();

    expect(container.querySelector('.top-bar-actions')).not.toBeInTheDocument();
  });

  it('does not render the actions panel when actions render nothing', () => {
    const { container } = renderTopBar(
      <>
        {false}
        {null}
      </>,
    );

    expect(container.querySelector('.top-bar-actions')).not.toBeInTheDocument();
  });

  it('renders the actions panel when actions are provided', () => {
    const { container } = renderTopBar(
      <button type="button">Refresh rewards</button>,
    );

    expect(container.querySelector('.top-bar-actions')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Refresh rewards' }),
    ).toBeInTheDocument();
  });

  it('wraps the chain dropdown in a compact selector slot', () => {
    const { container } = renderTopBar();

    const chainSlot = container.querySelector('.top-bar-chain-selector-slot');
    expect(chainSlot).toBeInTheDocument();
    expect(chainSlot?.querySelector('[data-testid="chain-dropdown"]')).toBeInTheDocument();
  });

  it('keeps a fixed-width account selector and flexible spacer before trailing items', () => {
    const { container } = renderTopBar(
      <button type="button">Refresh rewards</button>,
    );

    const topBar = container.querySelector('.top-bar');
    const accountPanel = container.querySelector('.account-selector-panel');
    const fillSpace = container.querySelector('.fill-space');
    const actions = container.querySelector('.top-bar-actions');
    const chainSlot = container.querySelector('.top-bar-chain-selector-slot');

    expect(accountPanel).toBeInTheDocument();
    expect(fillSpace).toBeInTheDocument();

    const children = Array.from(topBar?.children ?? []);
    expect(children.indexOf(accountPanel!)).toBeLessThan(children.indexOf(fillSpace!));
    expect(children.indexOf(fillSpace!)).toBeLessThan(children.indexOf(actions!));
    expect(children.indexOf(actions!)).toBeLessThan(children.indexOf(chainSlot!));
  });
});

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { MenuComponent } from 'src/common-ui/menu/menu.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ ariaLabel, onClick }: any) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick} />
  ),
}));

describe('MenuComponent', () => {
  it('provides accessible names for social links', () => {
    customRender(
      <MenuComponent
        title="Menu"
        isBackButtonEnable={false}
        menuItems={[]}
      />,
      { initialState: initialEmptyStateStore },
    );

    expect(screen.getByRole('button', { name: 'PeakD' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Discord' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'X (Twitter)' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medium' })).toBeInTheDocument();
  });
});

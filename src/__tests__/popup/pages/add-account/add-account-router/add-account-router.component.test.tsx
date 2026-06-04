import '@testing-library/jest-dom';
import { Screen } from '@interfaces/screen.interface';
import { screen } from '@testing-library/react';
import React from 'react';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { AddAccountRouterComponent } from 'src/popup/hive/pages/add-account/add-account-router/add-account-router.component';

import { I18nUtils } from 'src/utils/i18n.utils';
describe('AddAccountRouterComponent', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('renders add-by-auth when that screen is active', async () => {
    customRender(<AddAccountRouterComponent />, {
      initialState: {
        ...initialEmptyStateStore,
        navigation: {
          stack: [{ currentPage: Screen.ACCOUNT_PAGE_ADD_BY_AUTH }],
        },
      },
    });

    expect(
      await screen.findByTestId(`${Screen.ACCOUNT_PAGE_ADD_BY_AUTH}-page`),
    ).toBeInTheDocument();
  });
});

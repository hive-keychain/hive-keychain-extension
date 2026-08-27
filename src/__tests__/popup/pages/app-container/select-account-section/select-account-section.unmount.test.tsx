import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import React from 'react';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { initialStateForHome } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { SelectAccountSectionComponent } from 'src/popup/hive/pages/app-container/select-account-section/select-account-section.component';
import * as activeAccountActions from 'src/popup/hive/actions/active-account.actions';

import { I18nUtils } from 'src/utils/i18n.utils';
jest.mock('src/common-ui/preloaded-image/preloaded-image.component', () => ({
  PreloadedImage: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'preloaded-image' });
  },
}));

jest.mock('react-dropdown-select', () => ({
  __esModule: true,
  default: ({ contentRenderer }: any) => {
    const React = require('react');
    return React.createElement(
      'div',
      { 'aria-label': 'Dropdown select' },
      contentRenderer({}),
    );
  },
}));

jest.mock('src/common-ui/sortable-list/sortable-list.component', () => ({
  SortableListComponent: ({ children, items }: any) => {
    const React = require('react');
    return React.createElement(
      React.Fragment,
      null,
      items.map((item: unknown, index: number) =>
        children(item, index, {
          dragHandleRef: jest.fn(),
          isDragging: false,
        }),
      ),
    );
  },
}));

describe('select-account-section unmount behavior', () => {
  const hasUnmountedStateUpdateWarning = (
    consoleError: jest.SpyInstance<void, any[]>,
  ) =>
    consoleError.mock.calls.some((call) =>
      call.some(
        (arg) =>
          typeof arg === 'string' &&
          arg.includes(
            "Can't perform a React state update on an unmounted component",
          ),
      ),
    );

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('does not sync local state after unmount', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = customRender(<SelectAccountSectionComponent />, {
      initialState: initialStateForHome,
    });

    unmount();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);
  });

  it('uses controlled selectedAccountName without syncing from active account', () => {
    customRender(
      <SelectAccountSectionComponent
        selectedAccountName={userData.two.username}
        onAccountSelected={jest.fn()}
      />,
      { initialState: initialStateForHome },
    );

    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      userData.two.username,
    );
  });

  it('does not dispatch loadActiveAccount when controlled selection props are provided', () => {
    const loadActiveAccountSpy = jest.spyOn(
      activeAccountActions,
      'loadActiveAccount',
    );

    try {
      customRender(
        <SelectAccountSectionComponent
          selectedAccountName={userData.one.username}
          onAccountSelected={jest.fn()}
        />,
        { initialState: initialStateForHome },
      );

      expect(loadActiveAccountSpy).not.toHaveBeenCalled();
    } finally {
      loadActiveAccountSpy.mockRestore();
    }
  });
});

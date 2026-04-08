import '@testing-library/jest-dom';
import { act, cleanup } from '@testing-library/react';
import React from 'react';
import { initialStateForHome } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { SelectAccountSectionComponent } from 'src/popup/hive/pages/app-container/select-account-section/select-account-section.component';

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

jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: any) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  },
  Droppable: ({ children }: any) =>
    children({
      droppableProps: {},
      innerRef: jest.fn(),
      placeholder: null,
    }),
  Draggable: ({ children }: any) =>
    children({
      innerRef: jest.fn(),
      draggableProps: {},
      dragHandleProps: {},
    }),
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
    chrome.i18n.getMessage = jest.fn((key: string) => key);
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
});

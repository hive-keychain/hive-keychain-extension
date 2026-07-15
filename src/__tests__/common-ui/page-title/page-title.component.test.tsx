import '@testing-library/jest-dom';
import { Screen } from '@interfaces/screen.interface';
import React from 'react';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import {
  customRender,
  screen,
} from 'src/__tests__/utils-for-testing/setups/render';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({
    ariaLabel,
    dataTestId,
    onClick,
  }: {
    ariaLabel?: string;
    dataTestId?: string;
    onClick?: () => void;
  }) => (
    <button aria-label={ariaLabel} data-testid={dataTestId} onClick={onClick} />
  ),
}));

describe('PageTitleComponent', () => {
  it('labels back and close icon actions', () => {
    customRender(
      <PageTitleComponent
        title="Settings"
        skipTitleTranslation
        isBackButtonEnabled
      />,
      {
        initialState: {
          ...initialEmptyStateStore,
          navigation: {
            stack: [
              { currentPage: Screen.SETTINGS_ABOUT },
              { currentPage: Screen.HOME_PAGE },
            ],
          },
        },
      },
    );

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});

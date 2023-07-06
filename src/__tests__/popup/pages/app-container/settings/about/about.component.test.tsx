import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('about.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
    });
  });
  it('Must show about message', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.INFO),
      );
    });
    expect(
      screen.getByTestId(`${Icons.INFO}-page-content`).textContent,
    ).toMatch(
      manipulateStrings.removeHtmlTags(
        chrome.i18n.getMessage('popup_html_about_text'),
      ),
    );
  });
});

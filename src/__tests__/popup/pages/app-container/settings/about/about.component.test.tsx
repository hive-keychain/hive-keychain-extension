import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
describe('about.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
    });
  });
  it('Must show about message', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.INFO),
      );
    });
    expect(
      screen.getByLabelText(`${Icons.INFO}-page-content`).textContent,
    ).toMatch(
      manipulateStrings.removeHtmlTags(
        chrome.i18n.getMessage('popup_html_about_text'),
      ),
    );
  });
});

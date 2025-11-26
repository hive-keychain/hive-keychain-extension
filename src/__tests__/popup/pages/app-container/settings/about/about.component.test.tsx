import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

// Mock network requests
global.fetch = jest.fn((url: string) => {
  // Mock Hive Engine API calls
  if (url.includes('hive-engine') || url.includes('api.hive-engine')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ result: [] }),
    } as Response);
  }
  // Mock PeakD notifications API
  if (url.includes('notifications') || url.includes('peakd')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    } as Response);
  }
  // Mock other API calls
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ result: [] }),
  } as Response);
}) as jest.Mock;

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
    // Wait for the menu button to appear (component needs to finish initializing)
    await act(async () => {
      await screen.findByTestId(dataTestIdButton.menu);
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
    });
  });
  it('Must show about message', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + SVGIcons.MENU_ABOUT),
      );
    });
    expect(
      screen.getByTestId(`${SVGIcons.MENU_ABOUT}-page-content`).textContent,
    ).toMatch(
      manipulateStrings.removeHtmlTags(
        chrome.i18n.getMessage('popup_html_about_text'),
      ),
    );
  });
});

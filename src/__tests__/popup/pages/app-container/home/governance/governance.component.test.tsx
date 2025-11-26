import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdTab from 'src/__tests__/utils-for-testing/data-testid/data-testid-tab';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import witness from 'src/__tests__/utils-for-testing/data/witness';
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

describe('governance.component tests:\n', () => {
  jest.setTimeout(10000); // Increase timeout for this test suite
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          apiRelated: {
            KeychainApi: {
              customData: {
                witnessRanking: witness.ranking,
              },
            },
          },
        },
      },
    );
    // Wait for app to initialize
    await screen.findByTestId('clickable-settings');
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
    });
    // Wait for settings page to render
    await screen.findByTestId(`${Screen.SETTINGS_MAIN_PAGE}-page`);
    await act(async () => {
      // Find governance menu item
      const governanceMenuItem = await screen.findByTestId(
        dataTestIdButton.menuPreFix + SVGIcons.MENU_GOVERNANCE,
      );
      await userEvent.click(governanceMenuItem);
    });
    // Wait for navigation and data loading to complete
    await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`, {}, { timeout: 5000 });
  });

  it('Must load governance page & witness tab by default', async () => {
    expect(
      await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByTestId(dataTestIdDiv.rankingItem),
    ).toHaveLength(witness.ranking.length);
  });

  it('Must load proxy tab', async () => {
    // Wait for governance page to load first
    await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`);
    await act(async () => {
      const tabs = await screen.findAllByRole('tab');
      await userEvent.click(tabs[1]);
    });
    expect(await screen.findByTestId(dataTestIdTab.proxy)).toBeInTheDocument();
  });

  it('Must load proposal tab', async () => {
    // Wait for governance page to load first
    await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`);
    await act(async () => {
      const tabs = await screen.findAllByRole('tab');
      await userEvent.click(tabs[2]);
    });
    expect(await screen.findByTestId(dataTestIdTab.proposal)).toBeInTheDocument();
  });
});

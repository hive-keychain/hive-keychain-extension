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
import { Icons, SVGIcons } from 'src/common-ui/icons.enum';
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
  jest.setTimeout(30000); // Increase timeout for this test suite
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
    // Wait for home page to be rendered
    await screen.findByTestId(`${Screen.HOME_PAGE}-page`, {}, { timeout: 10000 });
    // Wait for components to initialize
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    await act(async () => {
      const menuButton = await screen.findByTestId(dataTestIdButton.menu, {}, { timeout: 5000 });
      await userEvent.click(menuButton);
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Click HIVE menu to access governance
      const hiveMenuButton = await screen.findByTestId(
        dataTestIdButton.menuPreFix + Icons.HIVE,
        {},
        { timeout: 5000 },
      );
      await userEvent.click(hiveMenuButton);
    });
    // Wait for navigation and data loading to complete
    await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`, {}, { timeout: 15000 });
    // Wait for tabs to be rendered (governance component shows loading spinner first)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });
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
    await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`, {}, { timeout: 15000 });
    // Wait for tabs to be rendered (governance component shows loading spinner first)
    await act(async () => {
      let tabs;
      let attempts = 0;
      while (attempts < 20) {
        tabs = screen.queryAllByRole('tab');
        // Also try finding by label text
        if (tabs.length === 0) {
          const labels = screen.queryAllByText(/witness|proxy|proposal/i);
          if (labels.length > 0) {
            tabs = labels;
            break;
          }
        } else {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }
      if (tabs && tabs.length > 1) {
        await userEvent.click(tabs[1]);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    });
    expect(await screen.findByTestId(dataTestIdTab.proxy, {}, { timeout: 15000 })).toBeInTheDocument();
  });

  it('Must load proposal tab', async () => {
    // Wait for governance page to load first
    await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`, {}, { timeout: 15000 });
    // Wait for tabs to be rendered (governance component shows loading spinner first)
    await act(async () => {
      let tabs;
      let attempts = 0;
      while (attempts < 20) {
        tabs = screen.queryAllByRole('tab');
        // Also try finding by label text
        if (tabs.length === 0) {
          const labels = screen.queryAllByText(/witness|proxy|proposal/i);
          if (labels.length > 0) {
            tabs = labels;
            break;
          }
        } else {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }
      if (tabs && tabs.length > 2) {
        await userEvent.click(tabs[2]);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    });
    expect(await screen.findByTestId(dataTestIdTab.proposal, {}, { timeout: 15000 })).toBeInTheDocument();
  });
});

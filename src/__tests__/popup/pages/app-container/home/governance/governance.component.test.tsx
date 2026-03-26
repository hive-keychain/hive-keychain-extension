import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdTab from 'src/__tests__/utils-for-testing/data-testid/data-testid-tab';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('governance.component tests:\n', () => {
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
          accountsRelated: {
            AccountUtils: {
              getAccountsFromLocalStorage: accounts.twoAccounts,
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(
          dataTestIdButton.menuPreFix + SVGIcons.MENU_GOVERNANCE,
        ),
      );
    });
    await screen.findByTestId('witness-tab');
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
    await act(async () => {
      await userEvent.click(
        screen.getByRole('radio', {
          name: chrome.i18n.getMessage('popup_html_proxy'),
        }),
      );
    });
    expect(await screen.findByTestId(dataTestIdTab.proxy)).toBeInTheDocument();
  });

  it('Must load proposal tab', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByRole('radio', {
          name: chrome.i18n.getMessage('popup_html_proposal'),
        }),
      );
    });
    expect(
      await screen.findByTestId(dataTestIdTab.proposal),
    ).toBeInTheDocument();
  });
});

import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('authorized-operations.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('No operations cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.PREFERENCES),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + Icons.AUTHORIZED_OPERATIONS,
          ),
        );
      });
    });
    it('Must load component and show no whitelisted operations', () => {
      expect(
        screen.getByTestId(`${Screen.SETTINGS_AUTHORIZED_OPERATIONS}-page`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(chrome.i18n.getMessage('popup_html_no_pref'), {
          exact: true,
        }),
      ).toBeInTheDocument();
    });
  });
  describe('Having operations cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            localStorageRelated: {
              customData: {
                customAuthorizedOP: {
                  'keychain.tests': {
                    'splinterlands.com': {
                      signTx: true,
                      post: true,
                    },
                    'leofinance.com': {
                      signTx: true,
                      post: true,
                    },
                  },
                },
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.PREFERENCES),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + Icons.AUTHORIZED_OPERATIONS,
          ),
        );
      });
    });
    it('Must load component and show info', async () => {
      expect(
        screen.getByTestId(`${Screen.SETTINGS_AUTHORIZED_OPERATIONS}-page`),
      ).toBeInTheDocument();
      expect(
        screen.getAllByTestId(dataTestIdDiv.authorizedOperations.item).length,
      ).toBe(4);
    });

    it('Must delete selected website', async () => {
      const deleteIconTestId = `icon-action-splinterlands.com-${chrome.i18n.getMessage(
        'popup_post',
      )}`;
      await act(async () => {
        await userEvent.click(screen.getByTestId(deleteIconTestId));
      });
      expect(screen.queryByTestId(deleteIconTestId)).not.toBeInTheDocument();
    });
  });
});

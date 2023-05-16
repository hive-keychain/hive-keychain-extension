import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelComponent from 'src/__tests__/utils-for-testing/aria-labels/aria-label-component';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
describe('authorized-operations.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('No operations cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.PREFERENCES),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.menuPreFix + Icons.AUTHORIZED_OPERATIONS,
          ),
        );
      });
    });
    it('Must load component and show no whitelisted operations', () => {
      expect(
        screen.getByLabelText(
          ariaLabelComponent.userPreferences.authorizedOperations,
        ),
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
        <App />,
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
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.PREFERENCES),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.menuPreFix + Icons.AUTHORIZED_OPERATIONS,
          ),
        );
      });
    });
    it('Must load component and show info', async () => {
      expect(
        screen.getByLabelText(
          ariaLabelComponent.userPreferences.authorizedOperations,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getAllByLabelText(ariaLabelDiv.authorizedOperations.item).length,
      ).toBe(4);
    });

    it('Must delete selected website', async () => {
      const toDelete = 'post-splinterlands.com';
      const ariaLabel =
        ariaLabelIcon.authorizedOperations.icon.delete.preFix + toDelete;
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabel));
      });
      expect(screen.queryByLabelText(ariaLabel)).not.toBeInTheDocument();
    });
  });
});

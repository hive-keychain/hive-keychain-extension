import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('settings-connected-dapps Hive whitelist tests:\n', () => {
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
        await userEvent.click(await screen.findByTestId(dataTestIdButton.menu));
        await userEvent.click(
          await screen.findByTestId(
            dataTestIdButton.menuPreFix + SVGIcons.MENU_PLUGINS,
          ),
        );
      });
    });
    it('Must load component and show no whitelisted operations', () => {
      expect(
        screen.getByTestId(`${Screen.SETTINGS_CONNECTED_DAPPS}-page`),
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
        await userEvent.click(await screen.findByTestId(dataTestIdButton.menu));
        await userEvent.click(
          await screen.findByTestId(
            dataTestIdButton.menuPreFix + SVGIcons.MENU_PLUGINS,
          ),
        );
      });
    });
    it('Must load component and show operation tags', async () => {
      expect(
        screen.getByTestId(`${Screen.SETTINGS_CONNECTED_DAPPS}-page`),
      ).toBeInTheDocument();
      expect(
        screen.getAllByTestId('hive-whitelisted-operation-tag').length,
      ).toBe(4);
    });

    it('Must delete selected operation', async () => {
      const operationTags = screen.getAllByTestId(
        'hive-whitelisted-operation-tag',
      );

      await act(async () => {
        await userEvent.click(operationTags[0]);
      });
      expect(
        screen.getAllByTestId('hive-whitelisted-operation-tag').length,
      ).toBe(3);
    });
  });
});

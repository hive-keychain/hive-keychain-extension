import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdToolTip from 'src/__tests__/utils-for-testing/data-testid/data-testid-tool-tip';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';

describe('estimated-account-value-section.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('with valid response from hive', () => {
    const accountValue = '999.99';
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountValue: accountValue,
              },
            },
          },
        },
      );
    });
    it('Must display the estimated account value', async () => {
      expect(
        await screen.findByLabelText(dataTestIdDiv.estimatedAccountValue),
      ).toHaveTextContent(`$ ${accountValue} USD`);
    });

    it('Must display custom tooltip on mouse enter', async () => {
      await act(async () => {
        await userEvent.hover(
          await screen.findByLabelText(
            dataTestIdToolTip.custom.estimatedValueSection,
          ),
        );
      });
      expect(
        (await screen.findByLabelText(dataTestIdToolTip.content)).innerHTML,
      ).toEqual(chrome.i18n.getMessage('popup_html_estimation_info_text'));
    });
  });

  describe('with no response from hive', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountValue: 0,
              },
            },
          },
        },
      );
    });
    it('Must display ... when account value not received', async () => {
      expect(
        await screen.findByLabelText(dataTestIdDiv.estimatedAccountValue),
      ).toHaveTextContent('...');
    });
  });
});

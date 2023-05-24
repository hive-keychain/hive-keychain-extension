import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelDropdown from 'src/__tests__/utils-for-testing/aria-labels/aria-label-dropdown';
import ariaLabelSelect from 'src/__tests__/utils-for-testing/aria-labels/aria-label-select';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import CurrencyUtils from 'src/utils/currency.utils';
describe('transfer-fund.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('HBD cases:\n', () => {
    describe('Having all keys:\n', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <App />,
          initialStates.iniStateAs.defaultExistent,
        );
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              `${
                ariaLabelDropdown.arrow.preFix
              }${CurrencyUtils.getCurrencyLabels(false).hbd.toLowerCase()}`,
            ),
          );
          await userEvent.click(
            screen.getByLabelText(ariaLabelDropdown.itemPreFix + Icons.SEND),
          );
        });
      });
      it('Must show transfer fund page with hbd as selected currency', async () => {
        expect(
          await screen.findByLabelText(`${Screen.TRANSFER_FUND_PAGE}-page`),
        ).toBeInTheDocument();
        expect(
          await screen.findByLabelText(ariaLabelSelect.accountSelector),
        ).toHaveTextContent(CurrencyUtils.getCurrencyLabels(false).hbd);
      });
    });
  });
});

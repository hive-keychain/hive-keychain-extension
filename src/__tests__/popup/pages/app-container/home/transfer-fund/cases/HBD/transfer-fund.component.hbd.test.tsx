import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import dataTestIdSelect from 'src/__tests__/utils-for-testing/data-testid/data-testid-select';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
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
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
        );
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              `${
                dataTestIdDropdown.arrow.preFix
              }${CurrencyUtils.getCurrencyLabels(false).hbd.toLowerCase()}`,
            ),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdDropdown.itemPreFix + Icons.SEND),
          );
        });
      });
      it('Must show transfer fund page with hbd as selected currency', async () => {
        expect(
          await screen.findByTestId(`${Screen.TRANSFER_FUND_PAGE}-page`),
        ).toBeInTheDocument();
        expect(
          //bellow the only element using an actual aria-label.
          await screen.findByLabelText(dataTestIdSelect.accountSelector),
        ).toHaveTextContent(CurrencyUtils.getCurrencyLabels(false).hbd);
      });
    });
  });
});

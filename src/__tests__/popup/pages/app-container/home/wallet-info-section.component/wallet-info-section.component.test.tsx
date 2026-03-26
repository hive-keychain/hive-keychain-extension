import CurrencyUtils from '@hiveapp/utils/currency.utils';
import { Asset } from '@hiveio/dhive';
import '@testing-library/jest-dom';
import { cleanup, screen } from '@testing-library/react';
import React from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import FormatUtils from 'src/utils/format.utils';
describe('wallet-info-section.component tests:\n', () => {
  describe('Regular Data:\n', () => {
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
    });
    it('Must show 3 info section rows with specific text content', async () => {
      const hiveBalanceFormatted = FormatUtils.formatCurrencyValue(
        accounts.asArray.extended[0].balance,
      );
      const hiveSavingsBalanceFormatted = FormatUtils.formatCurrencyValue(
        accounts.asArray.extended[0].savings_balance,
      );
      const hbdBalanceFormatted = FormatUtils.formatCurrencyValue(
        accounts.asArray.extended[0].hbd_balance,
      );
      const hbdSavingsBalanceFormatted = FormatUtils.formatCurrencyValue(
        accounts.asArray.extended[0].savings_hbd_balance,
      );
      const delegationsMainValueFormatted = FormatUtils.formatCurrencyValue(
        FormatUtils.toHP(
          accounts.asArray.extended[0].vesting_shares as string,
          dynamic.globalProperties,
        ),
      );
      const delegatedVestingShares = parseFloat(
        accounts.asArray.extended[0].delegated_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const receivedVestingShares = parseFloat(
        accounts.asArray.extended[0].received_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const delegationVestingShares = (
        receivedVestingShares - delegatedVestingShares
      ).toFixed(3);

      const delegationAmountSubValueFormatted = FormatUtils.formatCurrencyValue(
        FormatUtils.toHP(delegationVestingShares, dynamic.globalProperties),
      );
      const infoSectionRowListHTMLElements = await screen.findAllByTestId(
        /^dropdown-arrow-/,
      );
      expect(infoSectionRowListHTMLElements).toHaveLength(3);
      const savingsLabel = chrome.i18n.getMessage('popup_html_wallet_savings');
      const delegShort =
        chrome.i18n.getMessage('popup_html_delegations').slice(0, 5) + '.';
      expect(infoSectionRowListHTMLElements[0].textContent).toBe(
        `${CurrencyUtils.getCurrencyLabels(false).hive}${hiveBalanceFormatted}+${hiveSavingsBalanceFormatted} (${savingsLabel})`,
      );
      expect(infoSectionRowListHTMLElements[1].textContent).toBe(
        `${CurrencyUtils.getCurrencyLabels(false).hbd}${hbdBalanceFormatted}+${hbdSavingsBalanceFormatted} (${savingsLabel})`,
      );
      expect(infoSectionRowListHTMLElements[2].textContent).toBe(
        `${CurrencyUtils.getCurrencyLabels(false).hp}${delegationsMainValueFormatted}+${delegationAmountSubValueFormatted} (${delegShort})`,
      );
    });
  });

  describe('Irregular Data:\n', () => {
    describe('0 as balances', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
          {
            app: {
              accountsRelated: {
                AccountUtils: {
                  getExtendedAccount: {
                    ...accounts.extended,
                    delegated_vesting_shares: new Asset(0, 'VESTS'),
                    received_vesting_shares: new Asset(0, 'VESTS'),
                    balance: new Asset(0, 'HIVE'),
                    savings_balance: new Asset(0, 'HBD'),
                    hbd_balance: new Asset(0, 'HBD'),
                    savings_hbd_balance: new Asset(0, 'HBD'),
                    vesting_shares: new Asset(0, 'VESTS'),
                  },
                },
              },
            },
          },
        );
      });
      it('Must show 3 info section rows with zero values', async () => {
        const infoSectionRowListHTMLElements = await screen.findAllByTestId(
          /^dropdown-arrow-/,
        );
        expect(infoSectionRowListHTMLElements).toHaveLength(3);
        expect(infoSectionRowListHTMLElements[0].textContent).toBe(
          `${CurrencyUtils.getCurrencyLabels(false).hive}0.000`,
        );
        expect(infoSectionRowListHTMLElements[1].textContent).toBe(
          `${CurrencyUtils.getCurrencyLabels(false).hbd}0.000`,
        );
        expect(infoSectionRowListHTMLElements[2].textContent).toBe(
          `${CurrencyUtils.getCurrencyLabels(false).hp}0.000`,
        );
      });
    });
  });
});

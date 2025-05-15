import CurrencyUtils from '@hiveapp/utils/currency.utils';
import { Asset } from '@hiveio/dhive';
import '@testing-library/jest-dom';
import { cleanup, screen } from '@testing-library/react';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
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
        'wallet-info-section-row',
      );
      expect(infoSectionRowListHTMLElements).toHaveLength(3);
      expect(infoSectionRowListHTMLElements[0].textContent).toBe(
        `${hiveBalanceFormatted}+${hiveSavingsBalanceFormatted}${
          CurrencyUtils.getCurrencyLabels(false).hive
        }(${chrome.i18n.getMessage('popup_html_wallet_savings')})`,
      );
      expect(infoSectionRowListHTMLElements[1].textContent).toBe(
        `${hbdBalanceFormatted}+${hbdSavingsBalanceFormatted}${
          CurrencyUtils.getCurrencyLabels(false).hbd
        }(${chrome.i18n.getMessage('popup_html_wallet_savings')})`,
      );
      expect(infoSectionRowListHTMLElements[2].textContent).toBe(
        `${delegationsMainValueFormatted}+${delegationAmountSubValueFormatted}${
          CurrencyUtils.getCurrencyLabels(false).hp
        }(${
          chrome.i18n.getMessage('popup_html_delegations').slice(0, 5) + '.'
        })`,
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
          'wallet-info-section-row',
        );
        expect(infoSectionRowListHTMLElements).toHaveLength(3);
        expect(infoSectionRowListHTMLElements[0].textContent).toBe(
          `0.000${CurrencyUtils.getCurrencyLabels(false).hive}`,
        );
        expect(infoSectionRowListHTMLElements[1].textContent).toBe(
          `0.000${CurrencyUtils.getCurrencyLabels(false).hbd}`,
        );
        expect(infoSectionRowListHTMLElements[2].textContent).toBe(
          `0.000${CurrencyUtils.getCurrencyLabels(false).hp}`,
        );
      });
    });
  });
});

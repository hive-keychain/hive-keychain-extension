import { RewardsUtils } from '@hiveapp/utils/rewards.utils';
import { LocalAccount } from '@interfaces/local-account.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('top-bar.component tests:/n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('Has rewards to claim:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              RewardsUtils: {
                hasReward: true,
              },
            },
          },
        },
      );
    });

    it('Must show claim button', async () => {
      expect(
        await screen.findByTestId(dataTestIdIcon.reward),
      ).toBeInTheDocument();
    });

    it('Must claim reward & show message', async () => {
      const rewardHp =
        FormatUtils.withCommas(
          FormatUtils.toHP(
            accounts.extended.reward_vesting_balance
              .toString()
              .replace('VESTS', ''),
            dynamic.globalProperties,
          ).toString(),
        ) + ' HP';
      const claimedResources = [
        accounts.extended.reward_hive_balance,
        accounts.extended.reward_hbd_balance,
        rewardHp,
      ];
      RewardsUtils.claimRewards = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.reward));
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_claim_success', [
            claimedResources.join(', '),
          ]),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('No rewards to claim:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
      );
    });

    it('Must not show claim button', () => {
      expect(
        screen.queryByTestId(dataTestIdIcon.reward),
      ).not.toBeInTheDocument();
    });
  });

  describe('No posting key', () => {
    beforeEach(async () => {
      const cloneLocalAccounts = objects.clone(
        accounts.twoAccounts,
      ) as LocalAccount[];
      delete cloneLocalAccounts[0].keys.posting;
      delete cloneLocalAccounts[0].keys.postingPubkey;
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountsFromLocalStorage: cloneLocalAccounts,
              },
              RewardsUtils: {
                hasReward: true,
              },
            },
          },
        },
      );
    });

    it('Must show error when trying to claim', async () => {
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.reward));
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_accounts_err_claim'),
        ),
      ).toBeInTheDocument();
    });
  });
});

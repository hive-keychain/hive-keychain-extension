import ProposalUtils from '@hiveapp/utils/proposal.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import Config from 'src/config';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import FormatUtils from 'src/utils/format.utils';

describe('proposal-voting-section.component tests:\n', () => {
  let toHpSpy: jest.SpiedFunction<typeof FormatUtils.toHP>;

  afterEach(() => {
    toHpSpy?.mockRestore();
    jest.clearAllMocks();
    cleanup();
  });

  describe('With Active key', () => {
    beforeEach(async () => {
      // Banner hides when computed HP is under 100; fixture accounts are below that, and
      // globals are often unset on first paint. Stub HP so the section can render.
      toHpSpy = jest.spyOn(FormatUtils, 'toHP').mockReturnValue(500);
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            proposal: {
              ProposalUtils: {
                hasVotedForProposal: false,
                isRequestingProposalVotes: true,
              },
            },
          },
        },
      );
    });

    it('Must show keychain proposal', async () => {
      expect(
        await screen.findByTestId(dataTestIdDiv.proposalVotingSection),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          chrome.i18n.getMessage('popup_html_proposal_vote'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show success message when voting for keychain proposal and hide proposal section', async () => {
      ProposalUtils.voteForKeychainProposal = jest.fn().mockResolvedValue({
        tx_id: 'trx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.operation.voteProposal),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_kc_proposal_vote_successful'),
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId(dataTestIdDiv.proposalVotingSection),
      ).not.toBeInTheDocument();
    });

    it('Must show error on voting failed', async () => {
      ProposalUtils.voteForKeychainProposal = jest.fn().mockResolvedValue(null);
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.operation.voteProposal),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_proposal_vote_fail'),
        ),
      ).toBeInTheDocument();
    });

    it('Must open a new window when open to read', async () => {
      const sChromeTabs = jest.spyOn(chrome.tabs, 'create');
      const section = await screen.findByTestId(
        dataTestIdDiv.proposalVotingSection,
      );
      await act(async () => {
        await userEvent.click(
          within(section).getByRole('link', { name: /here/i }),
        );
      });
      expect(sChromeTabs).toHaveBeenCalledWith({
        url: `https://peakd.com/proposals/${Config.KEYCHAIN_PROPOSAL}`,
      });
      sChromeTabs.mockRestore();
    });
  });

  describe('No Active key', () => {
    beforeEach(async () => {
      toHpSpy = jest.spyOn(FormatUtils, 'toHP').mockReturnValue(500);
      const base = initialStates.iniStateAs.defaultExistent;
      const cloneLocalAccounts = objects.clone(
        accounts.twoAccounts,
      ) as LocalAccount[];
      delete cloneLocalAccounts[0].keys.active;
      delete cloneLocalAccounts[0].keys.activePubkey;
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        {
          ...base,
          hive: {
            ...base.hive,
            accounts: cloneLocalAccounts,
          },
        },
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountsFromLocalStorage: cloneLocalAccounts,
              },
            },
            proposal: {
              ProposalUtils: {
                hasVotedForProposal: false,
                isRequestingProposalVotes: true,
              },
            },
          },
        },
      );
    });
    it('Must show error trying to vote proposal', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.operation.voteProposal),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_missing_key', ['active']),
        ),
      ).toBeInTheDocument();
    });
  });
});

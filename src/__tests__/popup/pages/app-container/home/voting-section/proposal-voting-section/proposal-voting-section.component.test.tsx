import { TransactionResult } from '@interfaces/hive-tx.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import Config from 'src/config';
import ProposalUtils from 'src/utils/proposal.utils';

describe('proposal-voting-section.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('With Active key', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            proposal: {
              ProposalUtils: {
                hasVotedForProposal: false,
              },
            },
          },
        },
      );
    });

    it('Must show keychain proposal', async () => {
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_proposal_request'),
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
          screen.getByLabelText(ariaLabelDiv.proposalVotingSection),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.voteProposal),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_kc_proposal_vote_successful'),
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByLabelText(ariaLabelDiv.proposalVotingSection)?.className,
      ).toContain('hide');
    });

    it('Must show error on voting failed', async () => {
      ProposalUtils.voteForKeychainProposal = jest.fn().mockResolvedValue(null);
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDiv.proposalVotingSection),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.voteProposal),
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
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDiv.proposalVotingSection),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.readProposal),
        );
      });
      expect(sChromeTabs).toHaveBeenCalledWith({
        url: `https://peakd.com/me/proposals/${Config.KEYCHAIN_PROPOSAL}`,
      });
      sChromeTabs.mockRestore();
    });
  });

  describe('No Active key', () => {
    beforeEach(async () => {
      const cloneLocalAccounts = objects.clone(
        accounts.twoAccounts,
      ) as LocalAccount[];
      delete cloneLocalAccounts[0].keys.active;
      delete cloneLocalAccounts[0].keys.activePubkey;
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountsFromLocalStorage: cloneLocalAccounts,
              },
            },
          },
        },
      );
    });
    it('Must show error trying to vote proposal', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDiv.proposalVotingSection),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.voteProposal),
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

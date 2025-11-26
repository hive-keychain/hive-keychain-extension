import ProposalUtils from '@hiveapp/utils/proposal.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
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
import { Screen } from '@reference-data/screen.enum';

// Mock ProposalUtils methods
jest.mock('@hiveapp/utils/proposal.utils', () => {
  const actual = jest.requireActual('@hiveapp/utils/proposal.utils');
  return {
    ...actual,
    isRequestingProposalVotes: jest.fn(),
    hasVotedForProposal: jest.fn(),
    voteForKeychainProposal: jest.fn(),
  };
});

// Mock network requests
global.fetch = jest.fn((url: string) => {
  // Mock Hive Engine API calls
  if (url.includes('hive-engine') || url.includes('api.hive-engine')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ result: [] }),
    } as Response);
  }
  // Mock PeakD notifications API
  if (url.includes('notifications') || url.includes('peakd')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    } as Response);
  }
  // Mock other API calls
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ result: [] }),
  } as Response);
}) as jest.Mock;

describe('proposal-voting-section.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('With Active key', () => {
    beforeEach(async () => {
      // Mock ProposalUtils methods before rendering
      (ProposalUtils.isRequestingProposalVotes as jest.Mock).mockResolvedValue(true);
      (ProposalUtils.hasVotedForProposal as jest.Mock).mockResolvedValue(false);
      
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
      );
      // Wait for home page to be rendered
      await screen.findByTestId(`${Screen.HOME_PAGE}-page`, {}, { timeout: 10000 });
      // Wait for proposal voting section to initialize and render
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      });
    });

    it('Must show keychain proposal', async () => {
      // Wait for the proposal voting section to appear
      await screen.findByTestId(dataTestIdDiv.proposalVotingSection, {}, { timeout: 10000 });
      expect(
        await screen.findByText(
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
          await screen.findByTestId(dataTestIdDiv.proposalVotingSection, {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.operation.voteProposal, {}, { timeout: 5000 }),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_kc_proposal_vote_successful'),
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId(dataTestIdDiv.proposalVotingSection)?.className,
      ).toContain('hide');
    });

    it('Must show error on voting failed', async () => {
      ProposalUtils.voteForKeychainProposal = jest.fn().mockResolvedValue(null);
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdDiv.proposalVotingSection, {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.operation.voteProposal, {}, { timeout: 5000 }),
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
          await screen.findByTestId(dataTestIdDiv.proposalVotingSection, {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.readProposal, {}, { timeout: 5000 }),
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
      // Mock ProposalUtils methods before rendering
      (ProposalUtils.isRequestingProposalVotes as jest.Mock).mockResolvedValue(true);
      (ProposalUtils.hasVotedForProposal as jest.Mock).mockResolvedValue(false);
      
      const cloneLocalAccounts = objects.clone(
        accounts.twoAccounts,
      ) as LocalAccount[];
      delete cloneLocalAccounts[0].keys.active;
      delete cloneLocalAccounts[0].keys.activePubkey;
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
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
      // Wait for home page to be rendered
      await screen.findByTestId(`${Screen.HOME_PAGE}-page`, {}, { timeout: 10000 });
      // Wait for proposal voting section to initialize and render
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      });
    });
    it('Must show error trying to vote proposal', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdDiv.proposalVotingSection, {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.operation.voteProposal, {}, { timeout: 5000 }),
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

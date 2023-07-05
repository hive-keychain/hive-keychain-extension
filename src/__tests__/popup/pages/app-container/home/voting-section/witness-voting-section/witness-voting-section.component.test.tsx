import { TransactionResult } from '@interfaces/hive-tx.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/multichain-container/hive/hive-app.component';
import BlockchainTransactionUtils from 'src/utils/blockchain.utils';
import WitnessUtils from 'src/utils/witness.utils';
describe('witness-voting-section.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('With Active Key', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      });
    });

    it('Must show text message', async () => {
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('html_popup_made_with_love_by_stoodkev'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show success when voting', async () => {
      WitnessUtils.voteWitness = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      BlockchainTransactionUtils.delayRefresh = jest
        .fn()
        .mockResolvedValue(undefined);
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.voteStoodkevWitness),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('html_popup_vote_stoodkev_witness_success'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error when voting', async () => {
      WitnessUtils.voteWitness = jest
        .fn()
        .mockRejectedValue(new Error('Error trying to vote for witness'));
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.voteStoodkevWitness),
        );
      });
      expect(
        await screen.findByText('Error trying to vote for witness'),
      ).toBeInTheDocument();
    });
  });

  describe('No witness votes left', () => {
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
                  witnesses_voted_for: 30,
                },
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      });
    });
    it('Must show error if no witness votes left', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.voteStoodkevWitness),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage(
            'html_popup_vote_stoodkev_witness_error_30_votes',
          ),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('No Active Key', () => {
    beforeEach(async () => {
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
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      });
    });
    it('Must show error trying to vote', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.voteStoodkevWitness),
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

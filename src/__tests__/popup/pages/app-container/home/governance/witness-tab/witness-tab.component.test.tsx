import BlockchainTransactionUtils from '@hiveapp/utils/blockchain.utils';
import WitnessUtils from '@hiveapp/utils/witness.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import dataTestIdLink from 'src/__tests__/utils-for-testing/data-testid/data-testid-link';
import dataTestIdSwitch from 'src/__tests__/utils-for-testing/data-testid/data-testid-switch';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('witness tab:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('No errors when loading:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getExtendedAccount: { ...accounts.extended, proxy: '' },
              },
            },
            apiRelated: {
              KeychainApi: {
                customData: {
                  witnessRanking: witness.rankingWInactive,
                },
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.HIVE),
        );
      });
    });
    it('Must display only active witnesses', async () => {
      expect(
        await screen.findAllByTestId(dataTestIdDiv.rankingItem),
      ).toHaveLength(witness.rankingWInactive.length - 1);
    });

    it('Must display more information message', async () => {
      expect(
        (await screen.findByTestId(dataTestIdLink.linkToArcange)).textContent,
      ).toContain(chrome.i18n.getMessage('html_popup_link_to_witness_website'));
    });

    it('Must open link about more information', async () => {
      const sTabs = jest.spyOn(chrome.tabs, 'create');
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdLink.linkToArcange));
      });
      expect(sTabs).toHaveBeenCalledWith({ url: witness.arcangeLink });
      sTabs.mockRestore();
    });

    it('Must display no witnesses when typying a non existing witness on filter box', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.filter.ranking),
          'nonExistent',
        );
      });
      expect(screen.queryAllByTestId(dataTestIdDiv.rankingItem).length).toBe(0);
    });

    it('Must display 1 witness when typying blocktrades on filter box', async () => {
      const blocktradesWitnessName = witness.rankingWInactive.filter(
        (witness) => witness.name === 'blocktrades',
      )[0].name;
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.filter.ranking),
          blocktradesWitnessName,
        );
      });
      const rankingHTMLElements = screen.queryAllByTestId(
        dataTestIdDiv.rankingItem,
      );
      expect(rankingHTMLElements).toHaveLength(1);
      expect(rankingHTMLElements[0].textContent).toContain(
        `@${blocktradesWitnessName}`,
      );
    });

    it('Must show the inactive witness when unchecking on hide inactive', async () => {
      const inactiveWitnessName = witness.rankingWInactive.filter(
        (witnessItem) => witnessItem.signing_key === witness.inactiveKey,
      )[0].name;
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdSwitch.panel.witness.hideInactive),
        );
      });
      expect(
        await screen.findByText(`@${inactiveWitnessName}`),
      ).toBeInTheDocument();
    });

    it('Must show only voted witnesses when checking on voted only', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdSwitch.panel.witness.votedOnly),
        );
      });
      for (let i = 0; i < accounts.extended.witness_votes.length; i++) {
        const witnessNameVotedFor = accounts.extended.witness_votes[i];
        expect(
          await screen.findByText(witnessNameVotedFor, { exact: false }),
        ).toBeInTheDocument();
      }
      expect(
        (await screen.findAllByTestId(dataTestIdDiv.rankingItem)).length,
      ).toBe(accounts.extended.witness_votes.length);
    });

    it('Must create a new tab when clicking on witness link', async () => {
      const firstWitness = witness.rankingWInactive[0];
      const sTabs = jest.spyOn(chrome.tabs, 'create');
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            dataTestIdIcon.witness.linkToPagePrefix + firstWitness.name,
          ),
        );
      });
      expect(sTabs).toHaveBeenCalledWith({
        url: firstWitness.url,
      });
      sTabs.mockRestore();
    });

    it('Must show error when unvoting fails', async () => {
      BlockchainTransactionUtils.delayRefresh = jest
        .fn()
        .mockResolvedValue(undefined);
      WitnessUtils.unvoteWitness = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: false,
      } as TransactionResult);
      const selectedWitness = accounts.extended.witness_votes[0];
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            dataTestIdIcon.witness.votingPrefix + selectedWitness,
          ),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_error_unvote_wit', [
            `${selectedWitness}`,
          ]),
        ),
      ).toBeInTheDocument();
    });

    it('Must show success message when unvoting', async () => {
      BlockchainTransactionUtils.delayRefresh = jest
        .fn()
        .mockResolvedValue(undefined);
      WitnessUtils.unvoteWitness = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      const selectedWitness = accounts.extended.witness_votes[0];
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            dataTestIdIcon.witness.votingPrefix + selectedWitness,
          ),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_success_unvote_wit', [
            `${selectedWitness}`,
          ]),
        ),
      ).toBeInTheDocument();
    });

    it('Must catch & show error when unvoting', async () => {
      BlockchainTransactionUtils.delayRefresh = jest
        .fn()
        .mockResolvedValue(undefined);
      WitnessUtils.unvoteWitness = jest
        .fn()
        .mockRejectedValue(new Error('Error when unvoting witness'));
      const selectedWitness = accounts.extended.witness_votes[0];
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            dataTestIdIcon.witness.votingPrefix + selectedWitness,
          ),
        );
      });
      expect(
        await screen.findByText('Error when unvoting witness'),
      ).toBeInTheDocument();
    });

    it('Must show sucess message when voting', async () => {
      const selectedWitnessNameToVote = witness.rankingWInactive.find(
        (witness) => !accounts.extended.witness_votes.includes(witness.name),
      )?.name;
      BlockchainTransactionUtils.delayRefresh = jest
        .fn()
        .mockResolvedValue(undefined);
      WitnessUtils.voteWitness = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            dataTestIdIcon.witness.votingPrefix + selectedWitnessNameToVote,
          ),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_success_wit', [
            `${selectedWitnessNameToVote}`,
          ]),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('With errors on load:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getExtendedAccount: { ...accounts.extended, proxy: '' },
              },
            },
            apiRelated: {
              KeychainApi: {
                customData: {
                  witnessRanking: '',
                },
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.HIVE),
        );
      });
    });
    it('Must show 2 errors if request data fails', async () => {
      expect(
        await screen.findAllByText(
          chrome.i18n.getMessage('popup_html_error_retrieving_witness_ranking'),
          { exact: false },
        ),
      ).toHaveLength(2);
    });
  });
});

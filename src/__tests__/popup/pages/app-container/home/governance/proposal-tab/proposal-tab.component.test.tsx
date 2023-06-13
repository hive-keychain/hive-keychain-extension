import { Asset } from '@hiveio/dhive';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { Proposal } from '@interfaces/proposal.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelTab from 'src/__tests__/utils-for-testing/aria-labels/aria-label-tab';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import proposal from 'src/__tests__/utils-for-testing/data/proposal';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import ProposalUtils from 'src/utils/proposal.utils';

describe('Proposal tab:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  const proposalList = [
    ...proposal.expectedResultProposal,
    {
      creator: 'jack.keychain',
      dailyPay: Asset.fromString('330 HBD'),
      endDate: moment('2022-05-23T00:00:00'),
      startDate: moment('2022-01-23T00:00:00'),
      funded: 'totally_funded',
      id: 299,
      link: 'https://peakd.com/proposals/299',
      proposalId: 299,
      receiver: 'v4vapp.dhf',
      subject:
        'Continuation: Hive to Value 4 Value - The Hive <> Bitcoin Lightning Bridge',
      totalVotes: '40.27M HP',
      voted: true,
    } as Proposal,
  ];
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          proposal: {
            ProposalUtils: {
              getProposalList: proposalList,
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.HIVE),
      );
      await userEvent.click(screen.getAllByRole('tab')[2]);
    });
  });

  it('Must show actual proposal tab & proposal list', async () => {
    expect(
      await screen.findByLabelText(ariaLabelTab.proposal),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByLabelText(ariaLabelDiv.proposal.item.proposalItem),
    ).toHaveLength(proposalList.length);
  });

  it('Must show proposal details when clicking on dropdown icon', async () => {
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelDiv.proposal.prefixes.itemIconExpandable +
            proposalList[0].creator,
        ),
      );
    });
    expect(
      await screen.findByLabelText(
        ariaLabelDiv.proposal.prefixes.itemPanelExpandable +
          proposalList[0].creator,
      ),
    ).toHaveClass('expandable-panel opened');
  });

  it('Must navigate to creator profile when clicking on image', async () => {
    const selectedProposal = proposalList[0];
    const sTabs = jest.spyOn(chrome.tabs, 'create');
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelDiv.proposal.prefixes.itemImageGotoCreator +
            selectedProposal.creator,
        ),
      );
    });
    expect(sTabs).toHaveBeenCalledWith({
      url: `https://peakd.com/@${selectedProposal.creator}`,
    });
    sTabs.mockRestore();
  });

  it('Must navigate to proposal link, when clicking on proposal item title', async () => {
    const selectedProposal = proposalList[0];
    const sTabs = jest.spyOn(chrome.tabs, 'create');
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelDiv.proposal.prefixes.itemSpanGotoLink +
            selectedProposal.creator,
        ),
      );
    });
    expect(sTabs).toHaveBeenCalledWith({
      url: selectedProposal.link,
    });
    sTabs.mockRestore();
  });

  it('Must vote for proposal and show message', async () => {
    ProposalUtils.voteForProposal = jest.fn().mockResolvedValue({
      tx_id: 'tx_id',
      id: 'id',
      confirmed: true,
    } as TransactionResult);
    const selectedProposal = proposalList[0];
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelDiv.proposal.prefixes.itemIconVoteUnvote +
            selectedProposal.creator,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_proposal_vote_successful'),
      ),
    ).toBeInTheDocument();
  });

  it('Must unvote proposal and show message', async () => {
    ProposalUtils.unvoteProposal = jest.fn().mockResolvedValue({
      tx_id: 'tx_id',
      id: 'id',
      confirmed: true,
    } as TransactionResult);
    const selectedProposal = proposalList.find((proposal) => proposal.voted);
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelDiv.proposal.prefixes.itemIconVoteUnvote +
            selectedProposal!.creator,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_proposal_unvote_successful'),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error if unvote proposal fails', async () => {
    ProposalUtils.unvoteProposal = jest.fn().mockResolvedValue(null);
    const selectedProposal = proposalList.find((proposal) => proposal.voted);
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelDiv.proposal.prefixes.itemIconVoteUnvote +
            selectedProposal!.creator,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_proposal_unvote_fail'),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error if voting fails', async () => {
    ProposalUtils.voteForProposal = jest.fn().mockResolvedValue(null);
    const selectedProposal = proposalList[0];
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          ariaLabelDiv.proposal.prefixes.itemIconVoteUnvote +
            selectedProposal.creator,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_proposal_vote_fail'),
      ),
    ).toBeInTheDocument();
  });
});

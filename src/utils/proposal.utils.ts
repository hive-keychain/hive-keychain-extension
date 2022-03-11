import * as hive from '@hiveio/hive-js';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Proposal } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { store } from '@popup/store';
import moment from 'moment';
import Config from 'src/config';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';

const PROPOSAL_ID = Config.PROPOSAL;

const hasVotedForProposal = async (
  activeAccount: ActiveAccount,
): Promise<boolean> => {
  const listProposalVotes = await hive.api.listProposalVotesAsync(
    [PROPOSAL_ID, activeAccount.name],
    1,
    'by_proposal_voter',
    'ascending',
    'all',
  );
  return listProposalVotes[0].voter === activeAccount.name;
};

const voteForKeychainProposal = async (activeAccount: ActiveAccount) => {
  return await HiveUtils.voteForProposal(activeAccount, PROPOSAL_ID);
};

const voteForProposal = async (
  activeAccount: ActiveAccount,
  proposalId: number,
) => {
  return await HiveUtils.voteForProposal(activeAccount, PROPOSAL_ID);
};

const getProposalList = async (): Promise<Proposal[]> => {
  const result = await hive.api.callAsync('database_api.list_proposals', {
    start: [-1],
    limit: 1000,
    order: 'by_total_votes',
    order_direction: 'descending',
    status: 'votable',
  });

  return result.proposals.map((proposal: any) => {
    return {
      id: proposal.id,
      creator: proposal.creator,
      proposalId: proposal.proposal_id,
      subject: proposal.subject,
      receiver: proposal.receiver,
      dailyPay: `${
        parseFloat(proposal.daily_pay.amount) / 1000
      } ${FormatUtils.getSymbol(proposal.daily_pay.nai)}`,
      link: `https://peakd.com/proposals/${proposal.proposal_id}`,
      startDate: moment(proposal.start_date),
      endDate: moment(proposal.end_date),
      totalVotes: `${FormatUtils.nFormatter(
        FormatUtils.toHP(
          (parseFloat(proposal.total_votes) / 1000).toString(),
          store.getState().globalProperties.globals,
        ),
        4,
      )} HP`,
      voted: false,
    } as Proposal;
  });
};

const ProposalUtils = {
  hasVotedForProposal,
  voteForProposal,
  voteForKeychainProposal,
  getProposalList,
};

export default ProposalUtils;

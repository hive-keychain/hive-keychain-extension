import * as hive from '@hiveio/hive-js';
import { ActiveAccount } from '@interfaces/active-account.interface';
import {
  FundedOption,
  Proposal,
} from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
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
  console.log(listProposalVotes);
  return listProposalVotes[0].voter === activeAccount.name;
};

const voteForKeychainProposal = async (activeAccount: ActiveAccount) => {
  return await HiveUtils.voteForProposal(activeAccount, PROPOSAL_ID);
};

const voteForProposal = async (
  activeAccount: ActiveAccount,
  proposalId: number,
) => {
  return await HiveUtils.voteForProposal(activeAccount, proposalId);
};

const unvoteProposal = async (
  activeAccount: ActiveAccount,
  proposalId: number,
) => {
  return await HiveUtils.unvoteProposal(activeAccount, proposalId);
};

const getProposalList = async (accountName: string): Promise<Proposal[]> => {
  const result = await hive.api.callAsync('database_api.list_proposals', {
    start: [-1],
    limit: 1000,
    order: 'by_total_votes',
    order_direction: 'descending',
    status: 'votable',
  });

  const listProposalVotes = (
    await hive.api.callAsync('database_api.list_proposal_votes', {
      start: [accountName],
      limit: 1000,
      order: 'by_voter_proposal',
      order_direction: 'descending',
      status: 'votable',
    })
  ).proposal_votes
    .filter((item: any) => item.voter === accountName)
    .map((item: any) => item.proposal);

  let dailyBudget = await HiveUtils.getProposalDailyBudget();

  return result.proposals.map((proposal: any) => {
    let fundedOption = FundedOption.NOT_FUNDED;
    if (dailyBudget > 0) {
      if (dailyBudget - parseFloat(proposal.daily_pay.amount) / 1000 >= 0) {
        fundedOption = FundedOption.TOTALLY_FUNDED;
      } else {
        fundedOption = FundedOption.PARTIALLY_FUNDED;
      }
    }

    dailyBudget = dailyBudget - parseFloat(proposal.daily_pay.amount) / 1000;
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
          (parseFloat(proposal.total_votes) / 1000000).toString(),
          store.getState().globalProperties.globals,
        ),
        2,
      )} HP`,
      voted:
        listProposalVotes.find(
          (p: any) => p.proposal_id === proposal.proposal_id,
        ) !== undefined,
      funded: fundedOption,
    } as Proposal;
  });
};

const ProposalUtils = {
  hasVotedForProposal,
  voteForProposal,
  voteForKeychainProposal,
  getProposalList,
  unvoteProposal,
};

export default ProposalUtils;

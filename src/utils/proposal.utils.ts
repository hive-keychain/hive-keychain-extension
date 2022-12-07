import { Asset, UpdateProposalVotesOperation } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { FundedOption, Proposal } from '@interfaces/proposal.interface';
import { store } from '@popup/store';
import moment from 'moment';
import Config from 'src/config';
import AccountUtils from 'src/utils/account.utils';
import FormatUtils from 'src/utils/format.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const hasVotedForProposal = async (
  activeAccount: ActiveAccount,
  proposalId?: number,
): Promise<boolean> => {
  const listProposalVotes = await HiveTxUtils.getData(
    'condenser_api.list_proposal_votes',
    [
      [
        proposalId !== undefined ? proposalId : Config.KEYCHAIN_PROPOSAL,
        activeAccount.name,
      ],
      1,
      'by_proposal_voter',
      'ascending',
      'all',
    ],
  );
  return listProposalVotes[0].voter === activeAccount.name;
};
/* istanbul ignore next */
const voteForKeychainProposal = async (activeAccount: ActiveAccount) => {
  return await HiveTxUtils.sendOperation(
    [
      ProposalUtils.getUpdateProposalVoteOperation(
        activeAccount,
        Config.KEYCHAIN_PROPOSAL,
        false,
      ),
    ],
    activeAccount.keys.active!,
  );
};

/* istanbul ignore next */
const voteForProposal = async (
  activeAccount: ActiveAccount,
  proposalId: number,
) => {
  return await HiveTxUtils.sendOperation(
    [
      ProposalUtils.getUpdateProposalVoteOperation(
        activeAccount,
        proposalId,
        true,
      ),
    ],
    activeAccount.keys.active!,
  );
};
/* istanbul ignore next */
const unvoteProposal = async (
  activeAccount: ActiveAccount,
  proposalId: number,
) => {
  return await HiveTxUtils.sendOperation(
    [
      ProposalUtils.getUpdateProposalVoteOperation(
        activeAccount,
        proposalId,
        false,
      ),
    ],
    activeAccount.keys.active!,
  );
};

const getUpdateProposalVoteOperation = (
  activeAccount: ActiveAccount,
  proposalId: number,
  approve: boolean,
) => {
  return [
    'update_proposal_votes',
    {
      voter: activeAccount.name!,
      proposal_ids: [proposalId],
      approve: approve,
      extensions: [],
    },
  ] as UpdateProposalVotesOperation;
};

const getProposalList = async (accountName: string): Promise<Proposal[]> => {
  const listProposals = await HiveTxUtils.getData(
    'condenser_api.list_proposals',
    [[-1], 1000, 'by_total_votes', 'descending', 'votable'],
  );

  const listProposalVotesRequestResult = await HiveTxUtils.getData(
    'condenser_api.list_proposal_votes',
    [[accountName], 1000, 'by_voter_proposal', 'descending', 'votable'],
  );

  const listProposalVotes = listProposalVotesRequestResult
    .filter((item: any) => item.voter === accountName)
    .map((item: any) => item.proposal);

  let dailyBudget = await ProposalUtils.getProposalDailyBudget();
  return listProposals.map((proposal: any) => {
    const dailyPay = Asset.fromString(proposal.daily_pay);
    let fundedOption = FundedOption.NOT_FUNDED;
    if (dailyBudget > 0) {
      if (dailyBudget - dailyPay.amount / 1000 >= 0) {
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
      dailyPay: dailyPay,
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

const isRequestingProposalVotes = async () => {
  let dailyBudget = await ProposalUtils.getProposalDailyBudget();

  const proposals = (
    await HiveTxUtils.getData('condenser_api.list_proposals', [
      [-1],
      1000,
      'by_total_votes',
      'descending',
      'votable',
    ])
  ).map((proposal: any) => {
    const dailyPay = Asset.fromString(proposal.daily_pay);
    let fundedOption = FundedOption.NOT_FUNDED;
    if (dailyBudget > 0) {
      if (dailyBudget - dailyPay.amount / 1000 >= 0) {
        fundedOption = FundedOption.TOTALLY_FUNDED;
      } else {
        fundedOption = FundedOption.PARTIALLY_FUNDED;
      }
    }
    proposal.fundedOption = fundedOption;
    proposal.totalVotes = FormatUtils.toHP(
      (parseFloat(proposal.total_votes) / 1000000).toString(),
      store.getState().globalProperties.globals,
    );
    return proposal;
  });

  const keychainProposal = proposals.find(
    (proposal: any) => proposal.id === Config.KEYCHAIN_PROPOSAL,
  );
  const returnProposal = proposals.find(
    (proposal: any) => proposal.fundedOption == FundedOption.PARTIALLY_FUNDED,
  );

  const voteDifference =
    keychainProposal.totalVotes - returnProposal.totalVotes;
  return voteDifference < Config.PROPOSAL_MIN_VOTE_DIFFERENCE_HIDE_POPUP;
};

/* istanbul ignore next */
const getProposalDailyBudget = async () => {
  return (
    parseFloat(
      (await AccountUtils.getExtendedAccount('hive.fund')).hbd_balance
        .toString()
        .split(' ')[0],
    ) / 100
  );
};

const ProposalUtils = {
  hasVotedForProposal,
  voteForProposal,
  voteForKeychainProposal,
  getProposalList,
  unvoteProposal,
  isRequestingProposalVotes,
  getUpdateProposalVoteOperation,
  getProposalDailyBudget,
};

export default ProposalUtils;

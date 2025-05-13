import {
  Asset,
  CreateProposalOperation,
  DynamicGlobalProperties,
  RemoveProposalOperation,
  UpdateProposalVotesOperation,
} from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import { FundedOption, Proposal } from '@interfaces/proposal.interface';
import moment from 'moment';
import Config from 'src/config';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import FormatUtils from 'src/utils/format.utils';

const hasVotedForProposal = async (
  username: string,
  proposalId?: number,
): Promise<boolean> => {
  const listProposalVotes = await HiveTxUtils.getData(
    'condenser_api.list_proposal_votes',
    [
      [
        proposalId !== undefined ? proposalId : Config.KEYCHAIN_PROPOSAL,
        username,
      ],
      1,
      'by_proposal_voter',
      'ascending',
      'all',
    ],
  );
  return listProposalVotes[0].voter === username;
};
/* istanbul ignore next */
const voteForKeychainProposal = async (
  username: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return await HiveTxUtils.sendOperation(
    [
      ProposalUtils.getUpdateProposalVoteOperation(
        [Config.KEYCHAIN_PROPOSAL],
        true,
        username,
      ),
    ],
    activeKey,
    false,
    options,
  );
};

/* istanbul ignore next */
const voteForProposal = async (
  proposalId: number,
  username: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return await HiveTxUtils.sendOperation(
    [
      ProposalUtils.getUpdateProposalVoteOperation(
        [proposalId],
        true,
        username,
      ),
    ],
    activeKey,
    false,
    options,
  );
};
/* istanbul ignore next */
const unvoteProposal = async (
  proposalId: number,
  username: string,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return await HiveTxUtils.sendOperation(
    [
      ProposalUtils.getUpdateProposalVoteOperation(
        [proposalId],
        false,
        username,
      ),
    ],
    activeKey,
    false,
    options,
  );
};
/* istanbul ignore next */
const updateProposalVotes = async (
  proposalIds: number[],
  username: string,
  approve: boolean,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  return await HiveTxUtils.sendOperation(
    [
      ProposalUtils.getUpdateProposalVoteOperation(
        proposalIds,
        approve,
        username,
      ),
    ],
    activeKey,
    false,
    options,
  );
};
/* istanbul ignore next */
const getUpdateProposalVoteTransaction = (
  proposalIds: number[],
  username: string,
  approve: boolean,
) => {
  return HiveTxUtils.createTransaction([
    ProposalUtils.getUpdateProposalVoteOperation(
      proposalIds,
      approve,
      username,
    ),
  ]);
};
/* istanbul ignore next */
const getUpdateProposalVoteOperation = (
  proposalId: number[],
  approve: boolean,
  username: string,
) => {
  return [
    'update_proposal_votes',
    {
      voter: username,
      proposal_ids: proposalId,
      approve: approve,
      extensions: [],
    },
  ] as UpdateProposalVotesOperation;
};

const getFundedOption = (dailyPay: number, dailyBudget: number) => {
  let fundedOption = FundedOption.NOT_FUNDED;
  if (dailyBudget > 0) {
    if (dailyBudget - dailyPay >= 0) {
      fundedOption = FundedOption.TOTALLY_FUNDED;
    } else {
      fundedOption = FundedOption.PARTIALLY_FUNDED;
    }
  }
  return fundedOption;
};

const getProposalList = async (
  accountName: string,
  globals: DynamicGlobalProperties,
): Promise<Proposal[]> => {
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

  const proposals: Proposal[] = [];
  for (const p of listProposals) {
    const dailyPay = Asset.fromString(p.daily_pay);
    const fundedOption = ProposalUtils.getFundedOption(
      dailyPay.amount,
      dailyBudget,
    );
    proposals.push({
      id: p.id,
      creator: p.creator,
      proposalId: p.proposal_id,
      subject: p.subject,
      receiver: p.receiver,
      dailyPay: dailyPay,
      link: `https://peakd.com/proposals/${p.proposal_id}`,
      startDate: moment(p.start_date),
      endDate: moment(p.end_date),
      totalVotes: `${FormatUtils.nFormatter(
        FormatUtils.toHP(
          (parseFloat(p.total_votes) / 1000000).toString(),
          globals,
        ),
        2,
      )} HP`,
      voted:
        listProposalVotes.find(
          (votedProposal: any) => votedProposal.proposal_id === p.proposal_id,
        ) !== undefined,
      funded: fundedOption,
    } as Proposal);

    dailyBudget = dailyBudget - dailyPay.amount;
  }

  return proposals;
};

const isRequestingProposalVotes = async (globals: DynamicGlobalProperties) => {
  let dailyBudget = +(await ProposalUtils.getProposalDailyBudget());
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
      dailyBudget -= dailyPay.amount;
      if (dailyBudget >= 0) {
        fundedOption = FundedOption.TOTALLY_FUNDED;
      } else {
        fundedOption = FundedOption.PARTIALLY_FUNDED;
      }
    }
    proposal.fundedOption = fundedOption;
    proposal.totalVotes = FormatUtils.toHP(
      (parseFloat(proposal.total_votes) / 1000000).toString(),
      globals,
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
/* istanbul ignore next */
const createProposal = (
  username: string,
  receiver: string,
  startDate: string,
  endDate: string,
  dailyPay: string,
  subject: string,
  permlink: string,
  extensions: any,
  key: Key,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [
      ProposalUtils.getCreateProposalOperation(
        username,
        receiver,
        startDate,
        endDate,
        dailyPay,
        subject,
        permlink,
        extensions,
      ),
    ],
    key,
    false,
    options,
  );
};
/* istanbul ignore next */
const getCreateProposalOperation = (
  username: string,
  receiver: string,
  startDate: string,
  endDate: string,
  dailyPay: string,
  subject: string,
  permlink: string,
  extensions: any,
) => {
  return [
    'create_proposal',
    {
      creator: username,
      receiver: receiver,
      start_date: startDate,
      end_date: endDate,
      daily_pay: dailyPay,
      subject: subject,
      permlink: permlink,
      extensions:
        typeof extensions === 'string' ? JSON.parse(extensions) : extensions,
    },
  ] as CreateProposalOperation;
};
/* istanbul ignore next */
const getCreateProposalTransaction = (
  username: string,
  receiver: string,
  startDate: string,
  endDate: string,
  dailyPay: string,
  subject: string,
  permlink: string,
  extensions: any,
) => {
  return HiveTxUtils.createTransaction([
    ProposalUtils.getCreateProposalOperation(
      username,
      receiver,
      startDate,
      endDate,
      dailyPay,
      subject,
      permlink,
      extensions,
    ),
  ]);
};
/* istanbul ignore next */
const removeProposal = (
  owner: string,
  ids: number[],
  extensions: any,
  key: Key,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [ProposalUtils.getRemoveProposalOperation(owner, ids, extensions)],
    key!,
    false,
    options,
  );
};
/* istanbul ignore next */
const getRemoveProposalOperation = (
  owner: string,
  ids: number[],
  extensions: any,
) => {
  return [
    'remove_proposal',
    {
      proposal_owner: owner,
      proposal_ids: ids,
      extensions:
        typeof extensions === 'string' ? JSON.parse(extensions) : extensions,
    },
  ] as RemoveProposalOperation;
};
/* istanbul ignore next */
const getRemoveProposalTransaction = (
  owner: string,
  ids: number[],
  extensions: any,
) => {
  return HiveTxUtils.createTransaction([
    ProposalUtils.getRemoveProposalOperation(owner, ids, extensions),
  ]);
};

const ProposalUtils = {
  hasVotedForProposal,
  voteForProposal,
  voteForKeychainProposal,
  getProposalList,
  unvoteProposal,
  isRequestingProposalVotes,
  getUpdateProposalVoteOperation,
  getUpdateProposalVoteTransaction,
  getProposalDailyBudget,
  getFundedOption,
  createProposal,
  updateProposalVotes,
  removeProposal,
  getCreateProposalOperation,
  getCreateProposalTransaction,
  getRemoveProposalOperation,
  getRemoveProposalTransaction,
};

export default ProposalUtils;

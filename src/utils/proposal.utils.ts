import * as hive from '@hiveio/hive-js';
import { ActiveAccount } from '@interfaces/active-account.interface';
import Config from 'src/config';
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

const voteForProposal = async (activeAccount: ActiveAccount) => {
  return await HiveUtils.voteForProposal(activeAccount, PROPOSAL_ID);
};

const ProposalUtils = { hasVotedForProposal, voteForProposal };

export default ProposalUtils;

import {
  AccountWitnessVoteOperation,
  WitnessUpdateOperation,
} from '@hiveio/dhive';
import { WitnessProps } from '@hiveio/dhive/lib/utils';
import { Key } from '@interfaces/keys.interface';
import { Witness } from '@interfaces/witness.interface';
import { GovernanceUtils } from 'src/utils/governance.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
/* istanbul ignore next */
const voteWitness = async (witness: Witness, voter: string, activeKey: Key) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    true,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, activeKey);
};
/* istanbul ignore next */
const unvoteWitness = async (
  witness: Witness,
  voter: string,
  activeKey: Key,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    false,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, activeKey);
};
/* istanbul ignore next */
const updateWitnessVote = async (
  voter: string,
  witness: Witness,
  approve: boolean,
  activeKey: Key,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    approve,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, activeKey);
};
/* istanbul ignore next */
const sendWitnessOperation = async (
  witnessOperation: AccountWitnessVoteOperation,
  username: string,
  activeKey: Key,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(username);

  return await HiveTxUtils.sendOperation([witnessOperation], activeKey);
};
/* istanbul ignore next */
const getWitnessVoteOperation = (
  approve: boolean,
  voter: string,
  witnessName: string,
) => {
  return [
    'account_witness_vote',
    {
      account: voter,
      approve: approve,
      witness: witnessName,
    },
  ] as AccountWitnessVoteOperation;
};
/* istanbul ignore next */
const getUpdateWitnessTransaction = (
  voter: string,
  witness: Witness,
  approve: boolean,
) => {
  return HiveTxUtils.createTransaction([
    WitnessUtils.getWitnessVoteOperation(approve, voter, witness.name),
  ]);
};

//TODO discuss about types
const getWitnessAccountInfo = async (
  accountName: string,
): Promise<any | undefined> => {
  try {
    const witnessAccount = await HiveTxUtils.getData(
      'condenser_api.get_witness_by_account',
      [accountName],
    );
    console.log({ witnessAccount }); //TODO to remove
    return witnessAccount;
  } catch (error) {
    console.log({ error }); //TODO to remove
    return undefined;
  }
};

const getWitnessAccountUpdateOperation = (
  witnessAccountName: string,
  witnessUpdateProps: WitnessProps,
) => {
  return [
    'witness_update',
    {
      owner: witnessAccountName,
      props: witnessUpdateProps,
      block_signing_key: witnessUpdateProps.new_signing_key!,
      url: witnessUpdateProps.url!,
      fee: witnessUpdateProps.account_creation_fee!,
    },
  ] as WitnessUpdateOperation;
};

const sendWitnessAccountUpdateOperation = async (
  witnessAccountName: string,
  activeKey: Key,
  witnessUpdateProps: WitnessProps,
) => {
  const witnessAccountUpdateOperation = getWitnessAccountUpdateOperation(
    witnessAccountName,
    witnessUpdateProps,
  );
  return await HiveTxUtils.sendOperation(
    [witnessAccountUpdateOperation],
    activeKey,
  );
};

export const NB_WITNESS_VOTES_FETCHED = 10;
const getWitnessVoteListOrTotalVotes = async (
  witnessAccountName: string,
  returnList?: boolean,
) => {
  const resultArray: any[] = [];
  let lastAccountName = '';
  let foundDifferentWitnessIndex = -1;
  do {
    try {
      const witnessVotes = await HiveTxUtils.getData(
        'database_api.list_witness_votes',
        {
          start: [witnessAccountName, lastAccountName],
          limit: 100,
          order: 'by_witness_account',
        },
      );
      const votesArray = witnessVotes.votes;
      resultArray.push(votesArray);
      foundDifferentWitnessIndex = votesArray.findIndex(
        (vote: any) => vote.witness !== witnessAccountName,
      );
      lastAccountName = votesArray[votesArray.length - 1].account;
    } catch (error) {
      //exit per error
      foundDifferentWitnessIndex = -1;
      console.log('Error getting witnesses votes list.', { error });
    }
  } while (foundDifferentWitnessIndex === -1);
  console.log({ foundDifferentWitnessIndex }); //TODO to remove
  //final array
  resultArray[resultArray.length - 1] = resultArray[
    resultArray.length - 1
  ].filter((voter: any) => voter.witness === witnessAccountName);
  return returnList
    ? resultArray
    : resultArray.reduce((acc, curr) => acc + curr.length, 0);
};

const WitnessUtils = {
  unvoteWitness,
  voteWitness,
  getWitnessVoteOperation,
  sendWitnessOperation,
  updateWitnessVote,
  getUpdateWitnessTransaction,
  getWitnessAccountInfo,
  sendWitnessAccountUpdateOperation,
  getWitnessVoteListOrTotalVotes,
};

export default WitnessUtils;

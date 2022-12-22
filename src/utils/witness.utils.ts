import {
  AccountWitnessProxyOperation,
  AccountWitnessVoteOperation,
} from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { Witness } from '@interfaces/witness.interface';
import { GovernanceUtils } from 'src/utils/governance.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const voteWitness = async (
  witness: Witness,
  voter: string,
  activeKey: Key,
): Promise<boolean> => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    true,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, activeKey);
};

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

const sendWitnessOperation = async (
  witnessOperation: AccountWitnessVoteOperation,
  username: string,
  activeKey: Key,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(username);

  return await HiveTxUtils.sendOperation([witnessOperation], activeKey);
};

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

const setAsProxy = async (
  proxyName: string,
  username: string,
  activeKey: Key,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(username);
  return await HiveTxUtils.sendOperation(
    [getSetProxyOperation(proxyName, username)],
    activeKey,
  );
};

const getSetProxyOperation = (proxyName: string, username: string) => {
  return [
    'account_witness_proxy',
    { account: username, proxy: proxyName },
  ] as AccountWitnessProxyOperation;
};

const removeProxy = async (username: string, activeKey: Key) => {
  return setAsProxy('', username, activeKey);
};

const WitnessUtils = {
  unvoteWitness,
  voteWitness,
  setAsProxy,
  removeProxy,
  getWitnessVoteOperation,
  getSetProxyOperation,
  sendWitnessOperation,
  updateWitnessVote,
};

export default WitnessUtils;

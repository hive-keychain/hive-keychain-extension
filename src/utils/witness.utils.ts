import {
  AccountWitnessProxyOperation,
  AccountWitnessVoteOperation,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Key } from '@interfaces/keys.interface';
import { Witness } from '@interfaces/witness.interface';
import { GovernanceUtils } from 'src/utils/governance.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const voteWitness = async (
  witness: Witness,
  voter: string,
  privateKey: Key,
): Promise<boolean> => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    true,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, privateKey);
};

const unvoteWitness = async (
  witness: Witness,
  voter: string,
  privateKey: Key,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    false,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, privateKey);
};

const updateWitnessVote = async (
  voter: string,
  witness: Witness,
  approve: boolean,
  privateKey: Key,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    approve,
    voter,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, voter, privateKey);
};

const sendWitnessOperation = async (
  witnessOperation: AccountWitnessVoteOperation,
  username: string,
  privateKey: Key,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(username);

  return await HiveTxUtils.sendOperation([witnessOperation], privateKey);
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

const setAsProxy = async (proxyName: string, activeAccount: ActiveAccount) => {
  GovernanceUtils.removeFromIgnoreRenewal(activeAccount.name!);
  return await HiveTxUtils.sendOperation(
    [getSetProxyOperation(proxyName, activeAccount)],
    activeAccount.keys.active!,
  );
};

const getSetProxyOperation = (
  proxyName: string,
  activeAccount: ActiveAccount,
) => {
  return [
    'account_witness_proxy',
    { account: activeAccount.name, proxy: proxyName },
  ] as AccountWitnessProxyOperation;
};

const removeProxy = async (activeAccount: ActiveAccount) => {
  return setAsProxy('', activeAccount);
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

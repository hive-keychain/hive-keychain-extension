import {
  AccountWitnessProxyOperation,
  AccountWitnessVoteOperation,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Witness } from '@interfaces/witness.interface';
import { GovernanceUtils } from 'src/utils/governance.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const voteWitness = async (
  witness: Witness,
  activeAccount: ActiveAccount,
): Promise<boolean> => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    true,
    activeAccount.name!,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, activeAccount);
};

const unvoteWitness = async (
  witness: Witness,
  activeAccount: ActiveAccount,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    false,
    activeAccount.name!,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, activeAccount);
};

const updateWitnessVote = async (
  witness: Witness,
  activeAccount: ActiveAccount,
  approve: boolean,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    approve,
    activeAccount.name!,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(witnessOperation, activeAccount);
};

const sendWitnessOperation = async (
  witnessOperation: AccountWitnessVoteOperation,
  activeAccount: ActiveAccount,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(activeAccount.name!);

  return await HiveTxUtils.sendOperation(
    [witnessOperation],
    activeAccount.keys.active!,
  );
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

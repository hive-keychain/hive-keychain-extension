import {
  AccountWitnessProxyOperation,
  AccountWitnessVoteOperation,
  DynamicGlobalProperties,
  PrivateKey,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Witness } from '@interfaces/witness.interface';
import { GovernanceUtils } from 'src/utils/governance.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import HiveUtils from 'src/utils/hive.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import TransactionUtils from 'src/utils/transaction.utils';

const voteWitness = async (
  witness: Witness,
  activeAccount: ActiveAccount,
  globalProperties: DynamicGlobalProperties,
): Promise<boolean> => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    true,
    activeAccount.name!,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(
    witnessOperation,
    activeAccount,
    globalProperties,
  );
};

const unvoteWitness = async (
  witness: Witness,
  activeAccount: ActiveAccount,
  globalProperties: DynamicGlobalProperties,
) => {
  const witnessOperation = WitnessUtils.getWitnessVoteOperation(
    false,
    activeAccount.name!,
    witness.name,
  );

  return WitnessUtils.sendWitnessOperation(
    witnessOperation,
    activeAccount,
    globalProperties,
  );
};

const sendWitnessOperation = async (
  witnessOperation: AccountWitnessVoteOperation,
  activeAccount: ActiveAccount,
  globalProperties: DynamicGlobalProperties,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(activeAccount.name!);
  if (KeysUtils.isUsingLedger(activeAccount.keys.active!)) {
    const signedTransaction = await LedgerUtils.signTransaction(
      TransactionUtils.createTransaction(globalProperties, witnessOperation),
      activeAccount.keys.active!,
    );
    if (!signedTransaction) return false;
    return !!(await HiveUtils.sendOperationWithConfirmation(
      HiveUtils.getClient().broadcast.send(signedTransaction),
    ));
  } else {
    return !!(await HiveUtils.sendOperationWithConfirmation(
      HiveUtils.getClient().broadcast.sendOperations(
        [witnessOperation],
        PrivateKey.fromString(activeAccount.keys.active as string),
      ),
    ));
  }
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
};

export default WitnessUtils;

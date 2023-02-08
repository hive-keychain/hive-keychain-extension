import {
  AccountWitnessProxyOperation,
  AccountWitnessVoteOperation,
  PrivateKey,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Witness } from '@interfaces/witness.interface';
import { GovernanceUtils } from 'src/utils/governance.utils';
import HiveUtils from 'src/utils/hive.utils';

const voteWitness = async (
  witness: Witness,
  activeAccount: ActiveAccount,
): Promise<boolean> => {
  GovernanceUtils.removeFromIgnoreRenewal(activeAccount.name!);
  return !!(await HiveUtils.sendOperationWithConfirmation(
    HiveUtils.getClient().broadcast.sendOperations(
      [
        [
          'account_witness_vote',
          {
            account: activeAccount.name!,
            approve: true,
            witness: witness.name,
          },
        ] as AccountWitnessVoteOperation,
      ],
      PrivateKey.fromString(activeAccount.keys.active as string),
    ),
  ));
};

const unvoteWitness = async (
  witness: Witness,
  activeAccount: ActiveAccount,
) => {
  GovernanceUtils.removeFromIgnoreRenewal(activeAccount.name!);
  return !!(await HiveUtils.sendOperationWithConfirmation(
    HiveUtils.getClient().broadcast.sendOperations(
      [
        [
          'account_witness_vote',
          {
            account: activeAccount.name!,
            approve: false,
            witness: witness.name,
          },
        ] as AccountWitnessVoteOperation,
      ],
      PrivateKey.fromString(activeAccount.keys.active as string),
    ),
  ));
};

const setAsProxy = async (proxyName: string, activeAccount: ActiveAccount) => {
  GovernanceUtils.removeFromIgnoreRenewal(activeAccount.name!);
  return HiveUtils.sendOperationWithConfirmation(
    HiveUtils.getClient().broadcast.sendOperations(
      [
        [
          'account_witness_proxy',
          { account: activeAccount.name, proxy: proxyName },
        ] as AccountWitnessProxyOperation,
      ],
      PrivateKey.fromString(activeAccount.keys.active as string),
    ),
  );
};

const removeProxy = async (activeAccount: ActiveAccount) => {
  return setAsProxy('', activeAccount);
};

const WitnessUtils = { unvoteWitness, voteWitness, setAsProxy, removeProxy };

export default WitnessUtils;

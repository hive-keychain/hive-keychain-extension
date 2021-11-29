import { AccountWitnessVoteOperation, PrivateKey } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Witness } from '@interfaces/witness.interface';
import HiveUtils from 'src/utils/hive.utils';

const voteWitness = async (witness: Witness, activeAccount: ActiveAccount) => {
  return HiveUtils.getClient().broadcast.sendOperations(
    [
      [
        'account_witness_vote',
        { account: activeAccount.name!, approve: true, witness: witness.name },
      ] as AccountWitnessVoteOperation,
    ],
    PrivateKey.fromString(activeAccount.keys.active as string),
  );
};

const unvoteWitness = async (
  witness: Witness,
  activeAccount: ActiveAccount,
) => {
  return HiveUtils.getClient().broadcast.sendOperations(
    [
      [
        'account_witness_vote',
        { account: activeAccount.name!, approve: false, witness: witness.name },
      ] as AccountWitnessVoteOperation,
    ],
    PrivateKey.fromString(activeAccount.keys.active as string),
  );
};

const WitnessUtils = { unvoteWitness, voteWitness };

export default WitnessUtils;

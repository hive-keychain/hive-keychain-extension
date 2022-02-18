import RPCModule from '@background/rpc.module';
import {
  Asset,
  ClaimRewardBalanceOperation,
  PrivateKey,
} from '@hiveio/dhive/lib/index-browser';
import { ActiveAccount } from '@interfaces/active-account.interface';

const claimRewards = async (
  activeAccount: ActiveAccount,
  rewardHive: string | Asset,
  rewardHBD: string | Asset,
  rewardVests: string | Asset,
): Promise<boolean> => {
  try {
    const client = await RPCModule.getClient();
    await client.broadcast.sendOperations(
      [
        [
          'claim_reward_balance',
          {
            account: activeAccount.name,
            reward_hive: rewardHive,
            reward_hbd: rewardHBD,
            reward_vests: rewardVests,
          },
        ] as ClaimRewardBalanceOperation,
      ],
      PrivateKey.fromString(activeAccount.keys.posting as string),
    );

    return true;
  } catch (err: any) {
    return false;
  }
};

const BgdHiveUtils = {
  claimRewards,
};

export default BgdHiveUtils;

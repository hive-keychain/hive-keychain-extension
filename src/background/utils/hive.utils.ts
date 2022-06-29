import RPCModule from '@background/rpc.module';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import {
  Asset,
  ClaimRewardBalanceOperation,
  PrivateKey,
  TransferFromSavingsOperation,
  TransferToSavingsOperation,
} from '@hiveio/dhive/lib/index-browser';
import { ActiveAccount } from '@interfaces/active-account.interface';
import Config from 'src/config';
import Logger from 'src/utils/logger.utils';

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

const claimAccounts = async (rc: Manabar, activeAccount: ActiveAccount) => {
  try {
    const freeAccountConfig = Config.claims.freeAccount;
    if (
      rc.percentage / 100 > freeAccountConfig.MIN_RC_PCT &&
      rc.max_mana > freeAccountConfig.MIN_RC
    ) {
      const client = await RPCModule.getClient();
      await client.broadcast.sendOperations(
        [
          [
            'claim_account',
            {
              creator: activeAccount.name,
              extensions: [],
              fee: '0.000 HIVE',
            },
          ],
        ],
        PrivateKey.fromString(activeAccount.keys.active as string),
      );
      Logger.info(`Claiming free account for @${activeAccount.name}`);
    } else Logger.info('Not enough RC% to claim account');
  } catch (err) {
    Logger.error(err);
  }
};

const claimSavings = async (activeAccount: ActiveAccount) => {
  const hasHbd =
    Asset.fromString(activeAccount.account.hbd_balance as string).amount >=
    0.001;
  if (hasHbd) {
    try {
      const client = await RPCModule.getClient();
      await client.broadcast.sendOperations(
        [
          [
            'transfer_to_savings',
            {
              amount: '0.001 HBD',
              from: activeAccount.name,
              memo: '',
              request_id: activeAccount.account.savings_withdraw_requests + 1,
              to: activeAccount.name!,
            },
          ] as TransferToSavingsOperation,
        ],
        PrivateKey.fromString(activeAccount.keys.active as string),
      );
      return true;
    } catch (err) {
      Logger.error(
        `Error while claiming savings for @${activeAccount.name}`,
        err,
      );
      return false;
    }
  } else {
    try {
      const client = await RPCModule.getClient();
      await client.broadcast.sendOperations(
        [
          [
            'transfer_from_savings',
            {
              amount: '0.001 HBD',
              from: activeAccount.name,
              memo: '',
              request_id: activeAccount.account.savings_withdraw_requests + 1,
              to: activeAccount.name!,
            },
          ] as TransferFromSavingsOperation,
        ],
        PrivateKey.fromString(activeAccount.keys.active as string),
      );
      return true;
    } catch (err) {
      Logger.error(
        `Error while claiming savings for @${activeAccount.name}`,
        err,
      );
      return false;
    }
  }
};

const BgdHiveUtils = {
  claimRewards,
  claimAccounts,
  claimSavings,
};

export default BgdHiveUtils;

// import RPCModule from '@background/rpc.module';
// import { Manabar } from '@hiveio/dhive/lib/chain/rc';
// import {
//   Asset,
//   ClaimRewardBalanceOperation,
//   PrivateKey,
//   TransferFromSavingsOperation,
//   TransferToSavingsOperation,
// } from '@hiveio/dhive/lib/index-browser';
// import { ActiveAccount } from '@interfaces/active-account.interface';
// import Config from 'src/config';
// import Logger from 'src/utils/logger.utils';

// const claimRewards = async (
//   activeAccount: ActiveAccount,
//   rewardHive: string | Asset,
//   rewardHBD: string | Asset,
//   rewardVests: string | Asset,
// ): Promise<boolean> => {
//   try {
//     const client = await RPCModule.getClient();
//     await client.broadcast.sendOperations(
//       [
//         [
//           'claim_reward_balance',
//           {
//             account: activeAccount.name,
//             reward_hive: rewardHive,
//             reward_hbd: rewardHBD,
//             reward_vests: rewardVests,
//           },
//         ] as ClaimRewardBalanceOperation,
//       ],
//       PrivateKey.fromString(activeAccount.keys.posting as string),
//     );

//     return true;
//   } catch (err: any) {
//     return false;
//   }
// };

// /* istanbul ignore next */
// const hasBalance = (balance: string | Asset, greaterOrEqualTo: number) => {
//   return typeof balance === 'string'
//     ? Asset.fromString(balance as string).amount >= greaterOrEqualTo
//     : balance.amount >= greaterOrEqualTo;
// };

const BgdHiveUtils = {
  // claimRewards,
  // claimAccounts,
  // claimSavings,
};

export default BgdHiveUtils;

// import BgdHiveUtils from '@background/utils/hive.utils';
// import { ActiveAccount } from '@interfaces/active-account.interface';
// import hiveUtilsMocks from 'src/__tests__/background/utils/mocks/hive.utils.mocks';
// import accounts from 'src/__tests__/utils-for-testing/data/accounts';
// import confirmations from 'src/__tests__/utils-for-testing/data/confirmations';
// import objects from 'src/__tests__/utils-for-testing/helpers/objects';
// describe('hive.utils tests:\n', () => {
//   const { mocks, method, spies } = hiveUtilsMocks;
//   const { constants } = hiveUtilsMocks;
//   const { client, tuple, noPendings } = constants;
//   method.afterEach;
//   describe('claimRewards cases:\n', () => {
//     it('Must return true', async () => {
//       mocks.getClient(client);
//       mocks.sendOperations(confirmations.trx);
//       expect(await BgdHiveUtils.claimRewards(...tuple.assets._string)).toBe(
//         true,
//       );
//     });
//     describe('Error cases:\n', () => {
//       beforeEach(() => {
//         mocks.getClient(client);
//         mocks.sendOperations(confirmations.trx);
//       });
//       it('Must return false if no posting key', async () => {
//         const clonedActiveAccount = objects.clone(
//           accounts.active,
//         ) as ActiveAccount;
//         delete clonedActiveAccount.keys.posting;
//         expect(
//           await BgdHiveUtils.claimRewards(
//             clonedActiveAccount,
//             '1000',
//             '1000',
//             '1000',
//           ),
//         ).toBe(false);
//       });

//       it('Must return false if wrong posting key', async () => {
//         const clonedActiveAccount = objects.clone(
//           accounts.active,
//         ) as ActiveAccount;
//         clonedActiveAccount.keys.posting =
//           clonedActiveAccount.keys.postingPubkey;
//         expect(
//           await BgdHiveUtils.claimRewards(
//             clonedActiveAccount,
//             '1000',
//             '1000',
//             '1000',
//           ),
//         ).toBe(false);
//       });
//     });
//   });
// });

//TODO delete this.
export {};

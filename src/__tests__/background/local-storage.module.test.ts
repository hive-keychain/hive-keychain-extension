//TODO re-do all tests bellow with new patterns + remove export + remove fake case
export {};
describe('local-storage.module tests:\n', () => {
  it.skip('skipped', () => {});
  it('Must pass', () => {});
  // const { constants, spies, methods, mocks } = localStorageModuleMocks;
  // const { autoLockDefault, noConfirm } = constants;
  // methods.afterEach;
  // it('Must call Logger', async () => {
  //   mocks.getValueFromLocalStorage({ customStorageVersion: '1.0' });
  //   await LocalStorageModule.checkAndUpdateLocalStorage();
  //   expect(spies.logger.info).toBeCalledWith(
  //     'Already has updated local storage',
  //   );
  // });
  // it('Must save all values in Local Storage', async () => {
  //   mocks.saveValueInLocalStorage;
  //   mocks.getValueFromLocalStorage({
  //     customAutolock: JSON.stringify(autoLockDefault),
  //     customRpcList: JSON.stringify(DefaultRpcs),
  //     customCurrentRpc: DefaultRpcs[1],
  //     customAuthorizedOP: JSON.stringify(noConfirm),
  //   });
  //   await LocalStorageModule.checkAndUpdateLocalStorage();
  //   expect(spies.saveValueInLocalStorage.mock.calls).toEqual([
  //     [LocalStorageKeyEnum.AUTOLOCK, autoLockDefault],
  //     [LocalStorageKeyEnum.CURRENT_RPC, DefaultRpcs[1]],
  //     [LocalStorageKeyEnum.SWITCH_RPC_AUTO, false],
  //     [LocalStorageKeyEnum.NO_CONFIRM, noConfirm],
  //     [LocalStorageKeyEnum.LOCAL_STORAGE_VERSION, 2],
  //   ]);
  // });
  // it('Must save SWITCH_RPC_AUTO as true an change current rpc', async () => {
  //   mocks.saveValueInLocalStorage;
  //   mocks.getValueFromLocalStorage({
  //     customAutolock: JSON.stringify(autoLockDefault),
  //     customRpcList: JSON.stringify(DefaultRpcs),
  //     customAuthorizedOP: JSON.stringify(noConfirm),
  //   });
  //   await LocalStorageModule.checkAndUpdateLocalStorage();
  //   expect(spies.saveValueInLocalStorage.mock.calls).toEqual([
  //     [LocalStorageKeyEnum.AUTOLOCK, autoLockDefault],
  //     [LocalStorageKeyEnum.SWITCH_RPC_AUTO, true],
  //     [
  //       LocalStorageKeyEnum.CURRENT_RPC,
  //       { ...DefaultRpcs[0], uri: 'https://api.hive.blog' },
  //     ],
  //     [LocalStorageKeyEnum.NO_CONFIRM, noConfirm],
  //     [LocalStorageKeyEnum.LOCAL_STORAGE_VERSION, 2],
  //   ]);
  // });
});

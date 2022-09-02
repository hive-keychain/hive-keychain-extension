import LocalStorageModule from '@background/local-storage.module';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import localStorageModuleMocks from 'src/__tests__/background/mocks/local-storage.module.mocks';
describe('local-storage.module tests:\n', () => {
  const { constants, spies, methods, mocks } = localStorageModuleMocks;
  const { autoLockDefault, noConfirm } = constants;
  methods.afterEach;
  it('Must call Logger', async () => {
    mocks.getValueFromLocalStorage({ customStorageVersion: '1.0' });
    await LocalStorageModule.checkAndUpdateLocalStorage();
    expect(spies.logger.info).toBeCalledWith(
      'Already has updated local storage',
    );
  });
  it('Must save all values in Local Storage', async () => {
    mocks.saveValueInLocalStorage;
    mocks.getValueFromLocalStorage({
      customAutolock: JSON.stringify(autoLockDefault),
      customsRpcs: JSON.stringify(DefaultRpcs),
      customCurrentRpc: DefaultRpcs[1],
      customAuthorizedOP: JSON.stringify(noConfirm),
    });
    await LocalStorageModule.checkAndUpdateLocalStorage();
    expect(spies.saveValueInLocalStorage.mock.calls).toEqual([
      [LocalStorageKeyEnum.AUTOLOCK, autoLockDefault],
      [LocalStorageKeyEnum.RPC_LIST, DefaultRpcs],
      [LocalStorageKeyEnum.CURRENT_RPC, DefaultRpcs[1]],
      [LocalStorageKeyEnum.SWITCH_RPC_AUTO, false],
      [LocalStorageKeyEnum.NO_CONFIRM, noConfirm],
      [LocalStorageKeyEnum.LOCAL_STORAGE_VERSION, 2],
    ]);
  });
  it('Must load rpc[0] as not found on defaults', async () => {
    mocks.saveValueInLocalStorage;
    mocks.getValueFromLocalStorage({
      customAutolock: JSON.stringify(autoLockDefault),
      customsRpcs: JSON.stringify(DefaultRpcs),
      customCurrentRpc: 'https://api.saturnoman.hive/',
      customAuthorizedOP: JSON.stringify(noConfirm),
    });
    await LocalStorageModule.checkAndUpdateLocalStorage();
    expect(spies.saveValueInLocalStorage.mock.calls).toEqual([
      [LocalStorageKeyEnum.AUTOLOCK, autoLockDefault],
      [LocalStorageKeyEnum.RPC_LIST, DefaultRpcs],
      [LocalStorageKeyEnum.CURRENT_RPC, DefaultRpcs[0]],
      [LocalStorageKeyEnum.SWITCH_RPC_AUTO, false],
      [LocalStorageKeyEnum.NO_CONFIRM, noConfirm],
      [LocalStorageKeyEnum.LOCAL_STORAGE_VERSION, 2],
    ]);
  });
  it('Must save SWITCH_RPC_AUTO as true and change current rpc', async () => {
    mocks.saveValueInLocalStorage;
    mocks.getValueFromLocalStorage({
      customAutolock: JSON.stringify(autoLockDefault),
      customRpcList: JSON.stringify(DefaultRpcs),
      customAuthorizedOP: JSON.stringify(noConfirm),
    });
    await LocalStorageModule.checkAndUpdateLocalStorage();
    expect(spies.saveValueInLocalStorage.mock.calls).toEqual([
      [LocalStorageKeyEnum.AUTOLOCK, autoLockDefault],
      [LocalStorageKeyEnum.SWITCH_RPC_AUTO, true],
      [LocalStorageKeyEnum.CURRENT_RPC, DefaultRpcs[0]],
      [LocalStorageKeyEnum.NO_CONFIRM, noConfirm],
      [LocalStorageKeyEnum.LOCAL_STORAGE_VERSION, 2],
    ]);
  });
});

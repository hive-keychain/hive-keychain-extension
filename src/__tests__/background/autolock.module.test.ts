import AutolockModule from '@background/autolock.module';
import { Autolock } from '@interfaces/autolock.interface';
import autolockModuleMocks from 'src/__tests__/background/mocks/autolock.module.mocks';
describe('autolock.module tests:\n', () => {
  const { mocks, methods, spies, constants } = autolockModuleMocks;
  const { loggerMsg, autoLock } = constants;
  methods.afterEach;
  describe('set cases:\n', () => {
    it('Must return undefined', async () => {
      expect(await AutolockModule.set({} as Autolock)).toBeUndefined();
      expect(spies.logger).not.toBeCalled();
    });
    it('Must set autoLock as Device', async () => {
      await AutolockModule.set(autoLock.deviceLock);
      expect(spies.logger).toBeCalledWith(loggerMsg(autoLock.deviceLock));
    });
    it('Must set autlock as Idle and set interval', async () => {
      await AutolockModule.set(autoLock.idleLock);
      expect(spies.logger).toBeCalledWith(loggerMsg(autoLock.idleLock));
      expect(spies.setDetectionInterval).toBeCalledWith(
        autoLock.idleLock.mn * 60,
      );
    });
  });
  describe('start cases:\n', () => {
    it('Must call Logger and return undefined', async () => {
      mocks.getValueFromLocalStorage(undefined);
      expect(await AutolockModule.start()).toBeUndefined();
      expect(spies.logger).toBeCalledWith('Starting autolock');
    });
  });
});

import { broadcastPowerUp } from '@background/requests/operations/ops/power';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import powerMocks from 'src/__tests__/background/requests/operations/ops/mocks/power-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('power tests:\n', () => {
  const { methods, constants } = powerMocks;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastPowerUp cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const error = 'private key should be a Buffer';
      const result = await broadcastPowerUp(requestHandler, data.powerUp);
      const { request_id, ...datas } = data.powerUp;
      expect(result).toEqual(
        messages.error.answerError(
          new TypeError(error),
          datas,
          request_id,
          `${chrome.i18n.getMessage('bgd_ops_error')} : ${error}`,
          undefined,
        ),
      );
    });
    it('Must return success', async () => {
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastPowerUp(requestHandler, data.powerUp);
      const { request_id, ...datas } = data.powerUp;
      expect(result).toEqual(
        messages.success.answerSucess(
          confirmed,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_pu', [datas.hive, datas.recipient]),
          undefined,
        ),
      );
    });
  });
});

import { convert } from '@background/requests/operations/ops/convert';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import convertMocks from 'src/__tests__/background/requests/operations/ops/mocks/convert-mocks';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('convert tests:\n', () => {
  const { methods, constants, mocks } = convertMocks;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  beforeEach(() => {
    requestHandler.data.rpc = DefaultRpcs[0];
  });
  describe('Default cases:\n', () => {
    it('Must return error if undefined key on handler', async () => {
      const result = await convert(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.keyBuffer(
          datas,
          request_id,
          new TypeError(
            "Cannot read properties of undefined (reading 'toString')",
          ),
          "Cannot read properties of undefined (reading 'toString')",
        ),
      );
    });
    it('Must return success with a non collateralized convertion', async () => {
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      HiveTxUtils.sendOperation = jest.fn().mockResolvedValue(true);
      const result = await convert(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.convert(true, datas, request_id, data.collaterized),
      );
    });
    it('Must return success with a collateralized convertion', async () => {
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      HiveTxUtils.sendOperation = jest.fn().mockResolvedValue(true);
      data.collaterized = true;
      const result = await convert(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.convert(true, datas, request_id, data.collaterized),
      );
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success with a non collateralized convertion', async () => {
      mocks.HiveTxUtils.sendOperation(true);
      mocks.LedgerModule.getSignatureFromLedger('signed!');
      mocks.broadcastAndConfirmTransactionWithSignature(true);
      requestHandler.setKeys('#ledgerKey1234', userData.one.encryptKeys.active);
      const result = await convert(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.convert(true, datas, request_id, data.collaterized),
      );
    });
  });
});

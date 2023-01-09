import { RequestsHandler } from '@background/requests/request-handler';
import { TransactionConfirmation } from '@hiveio/dhive';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import {
  KeychainRequestTypes,
  RequestId,
  RequestPowerDown,
  RequestPowerUp,
} from '@interfaces/keychain.interface';
import { DynamicGlobalPropertiesUtils } from 'src/utils/dynamic-global-properties.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  powerUp: {
    type: KeychainRequestTypes.powerUp,
    username: mk.user.one,
    recipient: mk.user.one,
    hive: '100',
    request_id: 1,
  } as RequestPowerUp & RequestId,
  powerDown: {
    type: KeychainRequestTypes.powerDown,
    username: mk.user.one,
    hive_power: '100',
    request_id: 1,
  } as RequestPowerDown & RequestId,
};

const confirmed = {
  id: '1',
  trx_num: 112234,
  block_num: 1223,
  expired: false,
} as TransactionConfirmation;

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
  getDynamicGlobalProperties: (globalDataProperties: GlobalProperties | {}) =>
    (DynamicGlobalPropertiesUtils.getDynamicGlobalProperties = jest
      .fn()
      .mockResolvedValue(globalDataProperties)),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
  }),
};

const constants = {
  data,
  requestHandler,
  confirmed,
};

export default {
  methods,
  constants,
  mocks,
};

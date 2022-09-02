import AccountModule from '@background/account';
import AutolockModule from '@background/autolock.module';
import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import RPCModule from '@background/rpc.module';
import SettingsModule from '@background/settings.module';
import * as Requests from 'src/background/requests/init';
import * as OperationIndex from 'src/background/requests/operations/index';
import Logger from 'src/utils/logger.utils';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';

const requestHandler = new RequestsHandler();

const spies = {
  performOperation: jest
    .spyOn(OperationIndex, 'performOperation')
    .mockResolvedValue(undefined),
  sendBackMk: jest.spyOn(MkModule, 'sendBackMk').mockResolvedValue(undefined),
  saveMk: jest.spyOn(MkModule, 'saveMk').mockReturnValue(undefined),
  sendBackImportedAccounts: jest
    .spyOn(AccountModule, 'sendBackImportedAccounts')
    .mockResolvedValue(undefined),
  setActiveRpc: jest
    .spyOn(RPCModule, 'setActiveRpc')
    .mockResolvedValue(undefined),
  closeWindow: jest
    .spyOn(requestHandler, 'closeWindow')
    .mockReturnValue(undefined),
  init: jest.spyOn(Requests, 'default').mockResolvedValue(undefined),
  sendMessage: jest
    .spyOn(chrome.runtime, 'sendMessage')
    .mockReturnValue(undefined),
  autolock: {
    set: jest.spyOn(AutolockModule, 'set').mockResolvedValue(undefined),
  },
  sendBackImportedFileContent: jest
    .spyOn(SettingsModule, 'sendBackImportedFileContent')
    .mockResolvedValue(undefined),
  logger: {
    log: jest.spyOn(Logger, 'log'),
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

const constants = {
  requestHandler,
  requestData: postMocks.constants.data,
};

export default {
  methods,
  constants,
  spies,
};

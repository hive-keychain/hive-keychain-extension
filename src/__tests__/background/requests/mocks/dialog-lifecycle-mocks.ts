import { RequestsHandler } from '@background/requests/request-handler';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
};

const spies = {
  requestHandler: {
    setConfirmed: jest.spyOn(requestHandler, 'setConfirmed'),
    setWindowId: jest.spyOn(requestHandler, 'setWindowId'),
    saveInLocalStorage: jest
      .spyOn(requestHandler, 'saveInLocalStorage')
      .mockResolvedValue(undefined),
  },
  chrome: {
    windows: {
      getCurrent: jest.spyOn(chrome.windows, 'getCurrent'),
    },
  },
  removeWindow: jest.spyOn(DialogLifeCycle, 'removeWindow'),
};

const methods = {
  afterAll: afterAll(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  }),
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
    jest.useFakeTimers('legacy');
  }),
};

const constants = {
  requestHandler,
};

export default {
  methods,
  constants,
  spies,
};

import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import BrowserUtils from 'src/utils/browser.utils';
import Logger from 'src/utils/logger.utils';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';

const data = {
  request: (command: DialogCommand, display_msg?: string) => {
    return {
      command: command,
      msg: {
        success: false,
        error: '',
        result: null,
        data: {},
        message: chrome.i18n.getMessage('bgd_auth_locked'),
        display_msg:
          display_msg ?? chrome.i18n.getMessage('bgd_auth_locked_desc'),
      },
      tab: 0,
      domain: 'domain',
    };
  },
  requestConfirmation: {
    command: DialogCommand.SEND_DIALOG_CONFIRM,
    data: { data: { type: 'non_existing_type' } },
    rpc: {},
    tab: 0,
    domain: 'domain',
    hiveEngineConfig: {},
  },
  requestResponse: {
    command: DialogCommand.ANSWER_REQUEST,
    msg: { message: 'Error on request response', success: false },
  },
};

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
  getCurrent: (chrome.windows.getCurrent = jest
    .fn()
    .mockResolvedValue({ id: 66 })),
  update: (chrome.windows.update = jest.fn().mockResolvedValue(undefined)),
  scroll: {
    intoView: () => (Element.prototype.scrollIntoView = jest.fn()),
  },
  dHiveHiveIO: (client: any) => {
    jest.mock('@hiveio/dhive', () => {
      const originalModule = jest.requireActual('@hiveio/dhive');
      return {
        __esModule: true,
        ...originalModule,
        Client: client,
      };
    });
  },
};

const spies = {
  sendResponse: jest
    .spyOn(BrowserUtils, 'sendResponse')
    .mockResolvedValue(undefined),
  sendMessage: jest
    .spyOn(chrome.runtime, 'sendMessage')
    .mockReturnValue(undefined),
  closeWindow: jest.spyOn(window, 'close').mockReturnValue(undefined),
  logger: {
    error: jest.spyOn(Logger, 'error'),
  },
};

const methods = {
  config: () => {
    beforeEach(() => {
      jest.useFakeTimers('legacy');
      mocks.getUILanguage();
      mocks.i18n();
      mocks.getCurrent;
      mocks.update;
      mocks.scroll.intoView();
    });
    afterEach(() => {
      afterTests.clean();
    });
  },
};

const constants = {
  data,
  props: {
    title: 'description',
    content: 'content in collapsible-item component',
  },
};

export default { methods, mocks, spies, constants };

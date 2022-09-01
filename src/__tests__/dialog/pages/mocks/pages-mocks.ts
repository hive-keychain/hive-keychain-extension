import HiveEngineUtils from 'src/utils/hive-engine.utils';
import Logger from 'src/utils/logger.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ClickOrType } from 'src/__tests__/utils-for-testing/interfaces/events';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';

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
  getUserBalance: (userBalance: [{ symbol: string; balance: string }]) =>
    (HiveEngineUtils.getUserBalance = jest.fn().mockResolvedValue(userBalance)),
};

const spies = {
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
    });
    afterEach(() => {
      afterTests.clean();
    });
  },
  typeNClick: async (
    password: string,
    confirmation: string,
    clickSignUp: boolean = false,
  ) => {
    let events: ClickOrType[] = [
      {
        ariaLabel: alInput.password,
        event: EventType.TYPE,
        text: password,
      },
      {
        ariaLabel: alInput.password_confirmation,
        event: EventType.TYPE,
        text: confirmation,
      },
    ];
    if (clickSignUp)
      events.push({
        ariaLabel: alButton.signUp,
        event: EventType.CLICK,
      });
    await clickTypeAwait(events);
  },
};

export default { methods, mocks, spies };

import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const messagesJsonFile = (filePath: string) => require(filePath);

const spies = {
  getURL: jest.spyOn(chrome.runtime, 'getURL'),
};

const mocks = {
  getUILanguage: (lang: string) =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue(lang)),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
  spyNMock: () => {
    jest.spyOn(chrome.runtime, 'getURL').mockImplementation((...args) => {
      return `public/${args[0]}`;
    });
    global.fetch = jest.fn().mockImplementation((...args): any => {
      return { json: () => messagesJsonFile(args[0]) };
    });
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.i18n();
    mocks.spyNMock();
  }),
};

export default {
  methods,
  mocks,
  spies,
};

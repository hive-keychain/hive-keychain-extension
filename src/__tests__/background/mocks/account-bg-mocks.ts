import MkModule from '@background/mk.module';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const constants = {};

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
  getValueFromLocalStorage: (msg: string | null) =>
    (LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(msg)),
};

const spies = {
  sendMessage: jest
    .spyOn(chrome.runtime, 'sendMessage')
    .mockReturnValue(undefined),
  getMk: (mk: string) => jest.spyOn(MkModule, 'getMk').mockResolvedValue(mk),
  saveValueInLocalStorage: jest
    .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
    .mockReturnValue(undefined),
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

export default {
  methods,
  constants,
  mocks,
  spies,
};

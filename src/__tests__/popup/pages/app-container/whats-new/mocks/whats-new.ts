import {
  Feature,
  Features,
  WhatsNewContent,
} from '@popup/pages/app-container/whats-new/whats-new.interface';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import {
  MocksChromeRunTime,
  MocksToUse,
} from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
import {
  customRenderFixed,
  waitFor,
} from 'src/__tests__/utils-for-testing/setups/render-fragment';

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  versionLog: {
    url: 'https://hive-keychain.com',
    version: '2.2',
    features: {
      en: [
        {
          anchor: 'anchor0',
          image: 'https://source.com/img0.png',
          title: 'title feature 0',
          description: 'this is the description of feature 0',
          extraInformation: 'extra info 0',
        } as Feature,
        {
          anchor: 'anchor1',
          image: 'https://source.com/img1.png',
          title: 'title feature 1',
          description: 'this is the description of feature 1',
          extraInformation: 'extra info 1',
        } as Feature,
        {
          anchor: 'anchor2',
          image: 'https://source.com/img2.png',
          title: 'title feature 2',
          description: 'this is the description of feature 2',
          extraInformation: 'extra info 2',
        } as Feature,
        {
          anchor: 'anchor3',
          image: 'https://source.com/im3.png',
          title: 'title feature 3',
          description: 'this is the description of feature 3',
          extraInformation: 'extra info 3',
        } as Feature,
      ],
    } as Features,
  } as WhatsNewContent,
};

const beforeEach = async (differVersions: boolean = false) => {
  let _asFragment: () => DocumentFragment;
  let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (differVersions) {
    dataMocks.customDataFromLocalStorage.customlastVersionSeen = '3.1';
    remock = {
      keyChainApiGet: {
        extensionVersion: constants.versionLog,
      },
      chromeRunTime: {
        getManifest: { version: '2.2.0', name: 'KeyChain Extension' },
      } as MocksChromeRunTime,
    };
  }
  mockPreset.setOrDefault(remock);
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;
  await waitFor(() => {});
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  spyChromeTab: () => jest.spyOn(chrome.tabs, 'create'),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};

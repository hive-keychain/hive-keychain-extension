import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRenderFixed } from 'src/__tests__/utils-for-testing/setups/render-fragment';

type ChooseFrom = 'rpcNode' | 'accountHistory';

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  messages: {
    rpcNode: {
      existent: i18n.get('html_popup_rpc_already_exist'),
      success: i18n.get('html_popup_new_rpc_save_success'),
    },
    accountHistory: {
      success: i18n.get('html_popup_new_account_history_save_success'),
    },
    invalidUrl: i18n.get('html_popup_url_not_valid'),
  },
};
/**
 * Intended to use App component as default.
 * You must use only inner params to handle different data/initialState.
 * Also it will return the fragment to use the snapshots feature.
 * @link https://jestjs.io/docs/snapshot-testing or https://goo.gl/fbAQLP
 */
const beforeEach = async (dataToPass?: CustomDataFromLocalStorage) => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (dataToPass) {
    dataMocks.customDataFromLocalStorage = dataToPass;
  }
  mockPreset.setOrDefault({});
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;

  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.tokens, alIcon.tokens.settings.open]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  cleanStr: (str: string) => str.replace('https://', '').split('/')[0],
  clickInputAction: async (interactingTo: ChooseFrom, inputText: string) => {
    await clickTypeAwait([
      {
        ariaLabel: alIcon.tokens.settings.actions[interactingTo].add,
        event: EventType.CLICK,
      },
      {
        ariaLabel: alInput.textInput,
        event: EventType.TYPE,
        text: inputText,
      },
      {
        ariaLabel: alIcon.tokens.settings.actions[interactingTo].save,
        event: EventType.CLICK,
      },
    ]);
  },
};

const extraMocks = {
  setActiveApi: () =>
    (HiveEngineConfigUtils.setActiveApi = jest.fn().mockReturnValue(undefined)),
  setActiveAccountHistoryApi: () =>
    (HiveEngineConfigUtils.setActiveAccountHistoryApi = jest
      .fn()
      .mockReturnValue(undefined)),
  addCustomRpc: () =>
    (HiveEngineConfigUtils.addCustomRpc = jest
      .fn()
      .mockResolvedValue(undefined)),
  addCustomAccountHistoryApi: () =>
    (HiveEngineConfigUtils.addCustomAccountHistoryApi = jest
      .fn()
      .mockResolvedValue(undefined)),
  deleteCustomRpc: () => {
    HiveEngineConfigUtils.deleteCustomRpc = jest.fn().mockResolvedValue([]);
    dataMocks.customDataFromLocalStorage = { customRpcList: [] };
  },
  deleteCustomAccountHistoryApi: () => {
    HiveEngineConfigUtils.deleteCustomAccountHistoryApi = jest
      .fn()
      .mockResolvedValue([]);
    dataMocks.customDataFromLocalStorage = { accountHistoryApi: [] };
  },
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};

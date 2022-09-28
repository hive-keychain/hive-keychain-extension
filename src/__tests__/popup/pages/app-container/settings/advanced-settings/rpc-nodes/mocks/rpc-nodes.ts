import { Icons } from '@popup/icons.enum';
import HiveUtils from 'src/utils/hive.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ClickOrType } from 'src/__tests__/utils-for-testing/interfaces/events';
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

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  snapshotName: {
    switchAuto: 'rpc-nodes.component Switch Auto',
    noSwitchAuto: 'rpc-nodes.component No Switch Auto',
  },
  message: {
    missingFields: i18n.get('popup_html_rpc_missing_fields'),
    existingUri: i18n.get('popup_html_rpc_uri_already_existing'),
    invalidUri: i18n.get('html_popup_url_not_valid'),
  },
  data: {
    invalidUri: 'www.www.rpcNode',
    toAdd: 'https://saturno.hive.com/rpc',
    newRpc: [
      {
        chainId: undefined,
        testnet: false,
        uri: 'https://saturno.hive.com/rpc',
      },
    ],
  },
};

const beforeEach = async (data?: CustomDataFromLocalStorage) => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (data) {
    dataMocks.customDataFromLocalStorage = data;
  }
  mockPreset.setOrDefault({});
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;
  await assertion.awaitMk(constants.username);
  await clickAwait([
    alButton.menu,
    alButton.menuPreFix + Icons.SETTINGS,
    alButton.menuPreFix + Icons.RPC,
  ]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  typeNClick: async (toUse: {
    input: string;
    checkTestnet?: boolean;
    setAsActive?: boolean;
  }) => {
    let events: ClickOrType[] = [
      { ariaLabel: alButton.rpcNodes.addRpc, event: EventType.CLICK },
      {
        ariaLabel: alInput.rpcNodes.uri,
        event: EventType.TYPE,
        text: toUse.input,
      },
    ];
    if (toUse.checkTestnet) {
      events.push({
        ariaLabel: alCheckbox.rpcNodes.select.addTesnetNode,
        event: EventType.CLICK,
      });
    }
    if (toUse.setAsActive) {
      events.push({
        ariaLabel: alCheckbox.rpcNodes.select.setAsActive,
        event: EventType.CLICK,
      });
    }
    events.push({ ariaLabel: alButton.save, event: EventType.CLICK });
    await clickTypeAwait(events);
  },
};

const extraMocks = {
  setRpc: (HiveUtils.setRpc = jest.fn()),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};

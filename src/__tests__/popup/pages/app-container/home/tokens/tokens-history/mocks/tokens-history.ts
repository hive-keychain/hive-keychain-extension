import {
  MiningLotteryTransaction,
  OperationsHiveEngine,
} from '@interfaces/tokens.interface';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import tokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
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

const leoTokenMinningIndex = tokenHistory.leoToken.findIndex(
  (operation) => operation.operation === OperationsHiveEngine.MINING_LOTTERY,
);

const minningOperationData = tokenHistory.leoToken.filter(
  (op) => op.operation === OperationsHiveEngine.MINING_LOTTERY,
)[0] as MiningLotteryTransaction;

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  message: {
    item: {
      miningLottery: i18n.get('popup_html_token_wallet_info_mining_lottery', [
        minningOperationData.amount,
        minningOperationData.poolId,
      ]),
    },
  },
  item: {
    index: leoTokenMinningIndex,
  },
};
/**
 * Intended to use App component as default.
 * You must use only inner params to handle different data/initialState.
 * Also it will return the fragment to use the snapshots feature.
 * @link https://jestjs.io/docs/snapshot-testing or https://goo.gl/fbAQLP
 */
const beforeEach = async (noTokenHistoryData: boolean = false) => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  let remock: MocksToUse = {};
  if (noTokenHistoryData) {
    remock = { tokens: { getTokenHistory: [] } };
  }
  mockPreset.setOrDefault(remock);
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.tokens]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  typeOnFilter: async (text: string) => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.filterBox,
        event: EventType.TYPE,
        text: text,
      },
    ]);
  },
};

export default {
  beforeEach,
  methods,
  constants,
};

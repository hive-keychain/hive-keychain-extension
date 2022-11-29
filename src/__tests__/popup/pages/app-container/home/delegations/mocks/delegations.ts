import { ReactElement } from 'react';
import { DelegationUtils } from 'src/utils/delegation.utils';
import TransferUtils from 'src/utils/transfer.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ClickOrType } from 'src/__tests__/utils-for-testing/interfaces/events';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string) => mocksImplementation.i18nGetMessageCustom(key),
};

const constants = {
  message: {
    error: {
      incomming: i18n.get('popup_html_error_retrieving_incoming_delegations'),
      delegation: i18n.get('popup_html_delegation_fail'),
      cancellation: i18n.get('popup_html_cancel_delegation_fail'),
      powerUpDown: i18n.get('popup_html_power_up_down_error'),
    },
    success: {
      delegation: i18n.get('popup_html_delegation_successful'),
      cancelation: i18n.get('popup_html_cancel_delegation_successful'),
    },
  },
};

const beforeEach = async (component: ReactElement, passErrorData: boolean) => {
  let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (passErrorData) {
    remock = {
      keyChainApiGet: { customData: { delegators: { data: '' } } },
    };
  }
  mockPreset.setOrDefault(remock);
  renders.wInitialState(component, initialStates.iniStateAs.defaultExistent);
  await assertion.awaitMk(mk.user.one);
  await methods.clickToDelegations();
};

const methods = {
  clickToDelegations: async () => {
    await clickAwait([
      alDropdown.arrow.hp,
      'dropdown-menu-item-hp-delegation.svg',
    ]);
  },
  after: afterEach(() => {
    afterTests.clean();
  }),
  assertPageAnd: (text: string) => {
    assertion.getByText([
      {
        arialabelOrText: alComponent.incomingOutgoingPage,
        query: QueryDOM.BYLABEL,
      },
      {
        arialabelOrText: text,
        query: QueryDOM.BYTEXT,
      },
    ]);
  },
  typeNClick: async (
    username: string,
    amount: string,
    confirmBtn: boolean,
    isCancellation: boolean = false,
  ) => {
    let events: ClickOrType[] = [
      { ariaLabel: alInput.username, event: EventType.TYPE, text: username },
      { ariaLabel: alInput.amount, event: EventType.TYPE, text: amount },
      { ariaLabel: alButton.operation.delegate.submit, event: EventType.CLICK },
    ];
    if (isCancellation) {
      events.splice(1, 1);
    }
    if (confirmBtn) {
      events.push({
        ariaLabel: alButton.dialog.confirm,
        event: EventType.CLICK,
      });
    }
    await clickTypeAwait(events);
  },
};

const extraMocks = (delegateVestingShares: boolean) => {
  DelegationUtils.delegateVestingShares = jest
    .fn()
    .mockResolvedValue(delegateVestingShares);
  TransferUtils.saveFavoriteUser = jest.fn();
};

/**
 * Conveniently to add data to be checked on home page, as text or aria labels.
 */
const userInformation = {
  onScreen: {
    total: {
      incoming: 'Total Incoming',
      outgoing: 'Total Outgoing',
      pendingOutgoingUndelegation: [],
    },
  },
  delegation: { maxAmount: '0.459' },
};

export default {
  beforeEach,
  userInformation,
  methods,
  constants,
  extraMocks,
};

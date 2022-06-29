import { MenuItem } from '@interfaces/menu-item.interface';
import { ReactElement } from 'react';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { overWriteMocks } from 'src/__tests__/utils-for-testing/defaults/overwrite';
import {
  OverwriteMock,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const constants = {};

const beforeEach = async (component: ReactElement, overwrite: boolean) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  if (overwrite) {
    overWriteMocks({
      powerUp: { getVestingDelegations: OverwriteMock.SET_AS_NOT_IMPLEMENTED },
      delegations: { getDelegators: OverwriteMock.SET_AS_NOT_IMPLEMENTED },
    });
  }
  renders.wInitialState(component, initialStates.iniStateAs.defaultExistent);
  await assertion.awaitMk(mk.user.one);
  await methods.clickToDelegations();
};

const methods = {
  clickToDelegations: async () => {
    await clickAwait([alDropdown.arrow.hp, alDropdown.span.delegations]);
  },
};

function fromArrayToAssert(
  arrayItems: MenuItem[] | DropdownMenuItemInterface[],
  preFix: string,
) {
  return arrayItems.map((item) => {
    return {
      arialabelOrText: `${preFix}${item.icon}`,
      query: QueryDOM.BYLABEL,
    };
  });
}

const extraMocks = () => {};

/**
 * Conveniently to add data to be checked on home page, as text or aria labels.
 */
const userInformation = () => {};

mocks.helper();

export default {
  beforeEach,
  userInformation,
  //methods,
  constants,
  extraMocks,
};

import { MenuItem } from '@interfaces/menu-item.interface';
import { screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import HiveUtils from 'src/utils/hive.utils';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const constants = {};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  renders.wInitialState(component, initialStates.iniStateAs.defaultExistent);
  expect(await screen.findByText(mk.user.one)).toBeDefined();
};

const methods = {
  clickAwaitDrop: async (ariaLabel: string) =>
    await clickAwait([ariaLabel, alDropdown.span.convert]),
  message: (key: string) => mocksImplementation.i18nGetMessageCustom(key),
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

const extraMocks = (convertOperation: boolean) => {
  HiveUtils.convertOperation = jest.fn().mockResolvedValue(convertOperation);
};

/**
 * Conveniently to add data to be checked on home page, as text or aria labels.
 */
const userInformation = () => {};

mocks.helper();

export default {
  beforeEach,
  userInformation,
  methods,
  constants,
  extraMocks,
};

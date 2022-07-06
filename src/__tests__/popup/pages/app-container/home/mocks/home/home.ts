import { LocalAccount } from '@interfaces/local-account.interface';
import { MenuItem } from '@interfaces/menu-item.interface';
import {
  HBDDropdownMenuItems,
  HiveDropdownMenuItems,
  HpDropdownMenuItems,
} from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import SettingsMenuItems from '@popup/pages/app-container/settings/settings-main-page/settings-main-page-menu-items';
import { ReactElement } from 'react';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import HiveUtils from 'src/utils/hive.utils';
import TransactionUtils from 'src/utils/transaction.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alHomeInformation from 'src/__tests__/utils-for-testing/aria-labels/al-home-information';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksDefault from 'src/__tests__/utils-for-testing/defaults/mocks';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const constants = {
  vpValue: mocksDefault._defaults._app.getVP!.toFixed(2).toString(),
  resourceCredits: mocksDefault._defaults._app.getVotingDollarsPerAccount
    ?.toFixed(2)
    .toString(),
  estimatedValue: '69999',
  iconsMenuSettings: fromArrayToAssert(SettingsMenuItems, alButton.menuPreFix),
  menuItems: {
    hive: fromArrayToAssert(HiveDropdownMenuItems, alDropdown.itemPreFix),
    hbd: fromArrayToAssert(HBDDropdownMenuItems, alDropdown.itemPreFix),
    hp: fromArrayToAssert(HpDropdownMenuItems, alDropdown.itemPreFix),
  },
};

const beforeEach = async (
  component: ReactElement,
  accounts: LocalAccount[],
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  renders.wInitialState(component, {
    ...initialStates.iniState,
    accounts: accounts,
  });
};

// const vpValue = mocksDefault._defaults._app.getVP!.toFixed(2).toString();
// const resourceCredits = mocksDefault._defaults._app.getVotingDollarsPerAccount
//   ?.toFixed(2)
//   .toString();

const methods = {
  manaReadyIn: () => HiveUtils.getTimeBeforeFull(manabar.percentage / 100),
  rcReadyIn: () =>
    HiveUtils.getTimeBeforeFull(mocksDefault._defaults._app.getVP!),
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

const extraMocks = () => {
  TransactionUtils.getLastTransaction = jest.fn().mockResolvedValue(1);
};

/**
 * Conveniently to add data to be checked on home page, as text or aria labels.
 */
const userInformation = () => {
  assertion.getByText([
    { arialabelOrText: mk.user.one, query: QueryDOM.BYTEXT },
    {
      arialabelOrText: alHomeInformation.elements.asText.estimated,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: alHomeInformation.elements.asText.currencies.hbd,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: alHomeInformation.elements.asText.currencies.hive,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: alHomeInformation.elements.asText.currencies.hp,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: 'Voting Mana',
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: `${constants.vpValue} % (${constants.vpValue} $)`,
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: 'Resource Credits',
      query: QueryDOM.BYTEXT,
    },
    {
      arialabelOrText: `${constants.resourceCredits} %`,
      query: QueryDOM.BYTEXT,
    },
  ]);
};

mocks.helper();

export default {
  beforeEach,
  userInformation,
  methods,
  constants,
  extraMocks,
};
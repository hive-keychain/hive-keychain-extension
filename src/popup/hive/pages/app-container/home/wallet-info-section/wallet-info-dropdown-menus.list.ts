import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import { Icons } from 'src/common-ui/icons.enum';
import { ConversionType } from 'src/popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import { Screen } from 'src/reference-data/screen.enum';

export const HiveDropdownMenuItems: DropdownMenuItemInterface[] = [
  {
    label: 'popup_html_send',
    labelParams: ['hive'],
    icon: Icons.SEND,
    nextScreen: Screen.TRANSFER_FUND_PAGE,
    nextScreenParams: { selectedCurrency: 'hive' },
  },
  {
    label: 'popup_html_pu',
    icon: Icons.ARROW_UPWARDS,
    nextScreen: Screen.POWER_UP_PAGE,
    nextScreenParams: { powerType: PowerType.POWER_UP },
  },
  {
    label: 'popup_html_convert_hive',
    icon: Icons.CONVERT,
    nextScreen: Screen.CONVERSION_PAGE,
    nextScreenParams: { conversionType: ConversionType.CONVERT_HIVE_TO_HBD },
  },
  {
    label: 'popup_html_save_hive',
    icon: Icons.SAVINGS,
    nextScreen: Screen.SAVINGS_PAGE,
    nextScreenParams: { selectedCurrency: 'hive' },
  },
];
export const HBDDropdownMenuItems: DropdownMenuItemInterface[] = [
  {
    label: 'popup_html_send',
    labelParams: ['hbd'],
    icon: Icons.SEND,
    nextScreen: Screen.TRANSFER_FUND_PAGE,
    nextScreenParams: { selectedCurrency: 'hbd' },
  },
  {
    label: 'popup_html_convert_hbd',
    icon: Icons.CONVERT,
    nextScreen: Screen.CONVERSION_PAGE,
    nextScreenParams: { conversionType: ConversionType.CONVERT_HBD_TO_HIVE },
  },
  {
    label: 'popup_html_save_hbd',
    icon: Icons.SAVINGS,
    nextScreen: Screen.SAVINGS_PAGE,
    nextScreenParams: { selectedCurrency: 'hbd' },
  },
];
export const HpDropdownMenuItems: DropdownMenuItemInterface[] = [
  {
    label: 'popup_html_delegate',
    icon: Icons.DELEGATIONS_HP,
    importedIcon: true,
    nextScreen: Screen.DELEGATION_PAGE,
  },
  {
    label: 'popup_html_delegate_rc',
    icon: Icons.DELEGATIONS_RC,
    importedIcon: true,
    nextScreen: Screen.RC_DELEGATIONS_PAGE,
  },
  {
    label: 'dialog_title_powerdown',
    icon: Icons.ARROW_DOWNWARDS,
    nextScreen: Screen.POWER_DOWN_PAGE,
    nextScreenParams: { powerType: PowerType.POWER_DOWN },
  },
];

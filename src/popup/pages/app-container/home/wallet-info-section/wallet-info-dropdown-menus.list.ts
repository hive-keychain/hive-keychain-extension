import { ConversionType } from '@popup/pages/app-container/home/conversion/conversion-type.enum';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { DropdownMenuItemInterface } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

export const HiveDropdownMenuItems: DropdownMenuItemInterface[] = [
  {
    label: 'popup_html_send',
    labelParams: ['hive'],
    icon: 'transfer.png',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
    nextScreenParams: { selectedCurrency: 'hive' },
  },
  {
    label: 'popup_html_pu',
    icon: 'powerup.png',
    nextScreen: Screen.POWER_UP_PAGE,
    nextScreenParams: { powerType: PowerType.POWER_UP },
  },
  {
    label: 'popup_html_buy_hive',
    icon: 'buy.svg',
    nextScreen: Screen.BUY_COINS_PAGE,
  },
  {
    label: 'popup_html_convert_hive',
    icon: 'import.svg',
    nextScreen: Screen.CONVERSION_PAGE,
    nextScreenParams: { conversionType: ConversionType.CONVERT_HIVE },
  },
];
export const HBDDropdownMenuItems: DropdownMenuItemInterface[] = [
  {
    label: 'popup_html_send',
    labelParams: ['hbd'],
    icon: 'transfer.png',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
    nextScreenParams: { selectedCurrency: 'hbd' },
  },
  {
    label: 'popup_html_buy_hbd',
    icon: 'buy.svg',
    nextScreen: Screen.BUY_COINS_PAGE,
  },
  {
    label: 'popup_html_convert_hbd',
    icon: 'import.svg',
    nextScreen: Screen.CONVERSION_PAGE,
    nextScreenParams: { conversionType: ConversionType.CONVERT_HBD },
  },
];
export const HpDropdownMenuItems: DropdownMenuItemInterface[] = [
  {
    label: 'popup_html_delegate',
    icon: 'delegate.png',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
  {
    label: 'dialog_title_powerdown',
    icon: 'powerdown.png',
    nextScreen: Screen.POWER_DOWN_PAGE,
    nextScreenParams: { powerType: PowerType.POWER_DOWN },
  },
];

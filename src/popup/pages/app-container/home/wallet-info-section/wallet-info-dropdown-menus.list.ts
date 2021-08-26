import { DropdownMenuItem } from 'src/common-ui/dropdown-menu/dropdown-menu-item/dropdown-menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

export const HiveDropdownMenuItems: DropdownMenuItem[] = [
  {
    label: 'popup_html_send',
    labelParams: ['hive'],
    icon: 'transfer.png',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
  {
    label: 'popup_html_pu',
    icon: 'powerup.png',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
  {
    label: 'popup_html_buy_hive',
    icon: 'buy.svg',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
  {
    label: 'popup_html_convert_hbd',
    icon: 'import.svg',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
];
export const HBDDropdownMenuItems: DropdownMenuItem[] = [
  {
    label: 'popup_html_send',
    labelParams: ['hbd'],
    icon: 'transfer.png',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
  {
    label: 'popup_html_buy_hbd',
    icon: 'buy.svg',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
  {
    label: 'popup_html_convert_hbd',
    icon: 'import.svg',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
];
export const HpDropdownMenuItems: DropdownMenuItem[] = [
  {
    label: 'popup_html_delegate',
    icon: 'delegate.png',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
  {
    label: 'dialog_title_powerdown',
    icon: 'powerdown.png',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
  },
];

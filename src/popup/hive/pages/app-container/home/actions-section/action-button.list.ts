import { NewIcons } from 'src/common-ui/icons.enum';
import { ActionButton } from 'src/interfaces/action-button.interface';
import { Screen } from 'src/reference-data/screen.enum';

export const ActionButtonList: ActionButton[] = [
  {
    label: 'ecosystem',
    nextScreen: Screen.CHAINS,
    icon: NewIcons.BOTTOM_BAR_ECOSYSTEM,
  },
  {
    label: 'popup_html_send_transfer',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
    nextScreenParams: { selectedCurrency: 'hive' },
    icon: NewIcons.BOTTOM_BAR_SEND,
  },
  {
    label: 'popup_html_buy',
    icon: NewIcons.BOTTOM_BAR_BUY,
    nextScreen: Screen.BUY_COINS_PAGE,
  },
  {
    label: 'popup_html_token_swaps',
    icon: NewIcons.BOTTOM_BAR_SWAPS,
    nextScreen: Screen.TOKEN_SWAP_PAGE,
  },
];

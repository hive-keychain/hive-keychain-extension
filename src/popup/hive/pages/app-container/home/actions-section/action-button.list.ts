import { SVGIcons } from 'src/common-ui/icons.enum';
import { ActionButton } from 'src/interfaces/action-button.interface';
import { Screen } from 'src/reference-data/screen.enum';

export const ActionButtonList: ActionButton[] = [
  {
    label: 'ecosystem',
    nextScreen: Screen.CHAINS,
    icon: SVGIcons.BOTTOM_BAR_ECOSYSTEM,
  },
  {
    label: 'popup_html_send_transfer',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
    nextScreenParams: { selectedCurrency: 'hive' },
    icon: SVGIcons.BOTTOM_BAR_SEND,
  },
  {
    label: 'popup_html_buy',
    icon: SVGIcons.BOTTOM_BAR_BUY,
    nextScreen: Screen.BUY_COINS_PAGE,
  },
  {
    label: 'html_popup_swaps_process_swap',
    icon: SVGIcons.BOTTOM_BAR_SWAPS,
    nextScreen: Screen.TOKEN_SWAP_PAGE,
  },
];

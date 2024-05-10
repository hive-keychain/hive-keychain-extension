import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { ActionButton } from 'src/interfaces/action-button.interface';

export const ActionButtonList = (selectedCurrency: string): ActionButton[] => {
  return [
    {
      label: 'ecosystem',
      nextScreen: Screen.ECOSYSTEM_PAGE,
      icon: SVGIcons.BOTTOM_BAR_ECOSYSTEM,
    },
    {
      label: 'popup_html_send_transfer',
      nextScreen: Screen.TRANSFER_FUND_PAGE,
      nextScreenParams: { selectedCurrency: selectedCurrency },
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
};

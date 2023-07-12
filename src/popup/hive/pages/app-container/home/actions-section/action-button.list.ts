import { NewIcons } from 'src/common-ui/icons.enum';
import { ActionButton } from 'src/interfaces/action-button.interface';
import { Screen } from 'src/reference-data/screen.enum';

export const ActionButtonList: ActionButton[] = [
  {
    label: 'chains',
    nextScreen: Screen.CHAINS,
    icon: NewIcons.CHAINS,
  },
  {
    label: 'popup_html_send_transfer',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
    nextScreenParams: { selectedCurrency: 'hive' },
    icon: NewIcons.SEND,
  },
  {
    label: 'popup_html_buy',
    icon: NewIcons.BUY,
    nextScreen: Screen.BUY_COINS_PAGE,
  },
  {
    label: 'popup_html_history',
    icon: NewIcons.HISTORY,
    nextScreen: Screen.WALLET_HISTORY_PAGE,
  },
  {
    label: 'popup_html_tokens',
    icon: NewIcons.HIVE_ENGINE,
    nextScreen: Screen.TOKENS_PAGE,
  },
];

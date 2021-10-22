import { ActionButton } from 'src/interfaces/action-button.interface';
import { Screen } from 'src/reference-data/screen.enum';

export const ActionButtonList: ActionButton[] = [
  {
    label: 'popup_html_send_transfer',
    nextScreen: Screen.TRANSFER_FUND_PAGE,
    nextScreenParams: { selectedCurrency: 'hive' },
    icon: 'btn-bg_send',
  },
  {
    label: 'popup_html_history',
    icon: 'btn-bg_history',
    nextScreen: Screen.WALLET_HISTORY_PAGE,
  },
  {
    label: 'popup_html_tokens',
    icon: 'btn-bg_tokens',
    nextScreen: Screen.TOKENS_PAGE,
  },

  {
    label: 'popup_html_witness',
    icon: 'solo',
    nextScreen: Screen.WITNESS_PAGE,
  },
];

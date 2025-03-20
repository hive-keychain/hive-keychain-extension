import { Screen } from '@interfaces/screen.interface';
import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface ActionButton {
  label: string;
  labelParams?: string[];
  icon: SVGIcons;
  nextScreen: Screen;
  nextScreenParams?: any;
}

export const EVMWalletInfoSectionActions = (
  token: NativeAndErc20Token,
): ActionButton[] => {
  return [
    {
      label: 'popup_html_send_transfer',
      nextScreen: Screen.TRANSFER_FUND_PAGE,
      nextScreenParams: {
        selectedCurrency: token,
      },
      icon: SVGIcons.WALLET_SEND,
    },
  ];
};

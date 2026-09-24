import { Screen } from '@interfaces/screen.interface';
import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { ActionButton } from '@popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-actions';
import { PortfolioRouteUtils } from '@popup/multichain/utils/portfolio-route.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';

export type { ActionButton };

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
    {
      label: 'popup_html_buy',
      icon: SVGIcons.PORTFOLIO_BUY,
      onClick: PortfolioRouteUtils.openBuy,
    },
    {
      label: 'html_popup_swaps_process_swap',
      icon: SVGIcons.PORTFOLIO_SWAP,
      onClick: PortfolioRouteUtils.openSwap,
    },
  ];
};

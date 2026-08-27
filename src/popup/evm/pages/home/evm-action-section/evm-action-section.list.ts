import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { PortfolioRouteUtils } from '@popup/multichain/utils/portfolio-route.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { ActionButton } from 'src/interfaces/action-button.interface';

export const EvmActionButtonList = (
  selectedToken: NativeAndErc20Token,
): ActionButton[] => {
  return [
    {
      label: 'ecosystem',
      nextScreen: MultichainScreen.ECOSYSTEM_PAGE,
      icon: SVGIcons.BOTTOM_BAR_ECOSYSTEM,
    },
    {
      label: 'popup_html_send_transfer',
      nextScreen: MultichainScreen.TRANSFER_FUND_PAGE,
      nextScreenParams: { selectedToken: selectedToken },
      icon: SVGIcons.BOTTOM_BAR_SEND,
    },
    {
      label: 'popup_html_receive',
      nextScreen: EvmScreen.EVM_RECEIVE_PAGE,
      icon: SVGIcons.BOTTOM_BAR_RECEIVE,
    },
    {
      label: 'popup_html_buy',
      icon: SVGIcons.BOTTOM_BAR_BUY,
      onClick: PortfolioRouteUtils.openBuy,
    },
    {
      label: 'html_popup_swaps_process_swap',
      icon: SVGIcons.BOTTOM_BAR_SWAPS,
      onClick: PortfolioRouteUtils.openSwap,
    },
  ];
};

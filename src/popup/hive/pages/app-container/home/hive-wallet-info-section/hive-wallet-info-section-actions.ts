import { Screen } from '@interfaces/screen.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { ConversionType } from '@popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { PowerType } from '@popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import { TokenOperationType } from '@popup/hive/pages/app-container/home/tokens/token-operation/token-operation.component';
import { PortfolioRouteUtils } from '@popup/multichain/utils/portfolio-route.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';

export interface ActionButton {
  label: string;
  labelParams?: string[];
  icon: SVGIcons;
  nextScreen?: Screen;
  nextScreenParams?: any;
  onClick?: () => void;
}

const getPortfolioSwapAction = (): ActionButton => ({
  label: 'html_popup_swaps_process_swap',
  icon: SVGIcons.PORTFOLIO_SWAP,
  onClick: PortfolioRouteUtils.openSwap,
});

export const HiveWalletInfoSectionActions = (
  tokenSymbol: string,
  tokenInfo?: Token,
  tokenBalance?: TokenBalance,
): ActionButton[] => {
  if (tokenSymbol === 'HBD') {
    return [
      {
        label: 'popup_html_send_transfer',
        icon: SVGIcons.WALLET_SEND,
        nextScreen: Screen.TRANSFER_FUND_PAGE,
        nextScreenParams: { selectedCurrency: 'hbd' },
      },
      {
        label: 'popup_html_convert',
        icon: SVGIcons.WALLET_CONVERT,
        nextScreen: Screen.CONVERSION_PAGE,
        nextScreenParams: {
          conversionType: ConversionType.CONVERT_HBD_TO_HIVE,
        },
      },
      {
        label: 'popup_html_savings',
        icon: SVGIcons.WALLET_SAVINGS,
        nextScreen: Screen.SAVINGS_PAGE,
        nextScreenParams: { selectedCurrency: 'hbd' },
      },
      getPortfolioSwapAction(),
    ];
  } else if (tokenSymbol === 'HIVE') {
    return [
      {
        label: 'popup_html_send_transfer',
        icon: SVGIcons.WALLET_SEND,
        nextScreen: Screen.TRANSFER_FUND_PAGE,
        nextScreenParams: { selectedCurrency: 'hive' },
      },
      {
        label: 'popup_html_pu',
        icon: SVGIcons.WALLET_POWER_UP,
        nextScreen: Screen.POWER_UP_PAGE,
        nextScreenParams: { powerType: PowerType.POWER_UP },
      },
      {
        label: 'popup_html_convert',
        icon: SVGIcons.WALLET_CONVERT,
        nextScreen: Screen.CONVERSION_PAGE,
        nextScreenParams: {
          conversionType: ConversionType.CONVERT_HIVE_TO_HBD,
        },
      },
      {
        label: 'popup_html_savings',
        icon: SVGIcons.WALLET_SAVINGS,
        nextScreen: Screen.SAVINGS_PAGE,
        nextScreenParams: { selectedCurrency: 'hive' },
      },
      getPortfolioSwapAction(),
    ];
  } else if (tokenSymbol === 'HP') {
    return [
      {
        label: 'popup_html_delegate_short',
        icon: SVGIcons.WALLET_HP_DELEGATIONS,
        nextScreen: Screen.DELEGATION_PAGE,
      },
      {
        label: 'popup_html_delegate_rc_short',
        icon: SVGIcons.WALLET_RC_DELEGATIONS,
        nextScreen: Screen.RC_DELEGATIONS_PAGE,
      },
      {
        label: 'dialog_title_powerdown',
        icon: SVGIcons.WALLET_POWER_DOWN,
        nextScreen: Screen.POWER_DOWN_PAGE,
        nextScreenParams: { powerType: PowerType.POWER_DOWN },
      },
    ];
  } else {
    const actions: ActionButton[] = [];
    actions.push({
      label: 'popup_html_send_transfer',
      nextScreen: Screen.TOKENS_TRANSFER,
      nextScreenParams: {
        tokenBalance,
        tokenInfo,
      },
      icon: SVGIcons.WALLET_SEND,
    });
    if (tokenInfo?.stakingEnabled) {
      actions.push({
        label: 'popup_html_token_stake',
        nextScreen: Screen.TOKENS_OPERATION,
        nextScreenParams: {
          tokenBalance,
          operationType: TokenOperationType.STAKE,
          tokenInfo: tokenInfo,
        },
        icon: SVGIcons.WALLET_TOKEN_STAKE,
      });
      actions.push({
        label: 'popup_html_token_unstake',
        nextScreen: Screen.TOKENS_OPERATION,
        nextScreenParams: {
          tokenBalance,
          operationType: TokenOperationType.UNSTAKE,
          tokenInfo: tokenInfo,
        },
        icon: SVGIcons.WALLET_TOKEN_UNSTAKE,
      });
    }
    if (tokenInfo?.delegationEnabled) {
      actions.push({
        label: 'popup_html_token_delegate',
        nextScreen: Screen.TOKENS_OPERATION,
        nextScreenParams: {
          tokenBalance,
          operationType: TokenOperationType.DELEGATE,
          tokenInfo: tokenInfo,
        },
        icon: SVGIcons.WALLET_TOKEN_DELEGATIONS,
      });
    }
    actions.push(getPortfolioSwapAction());

    return actions;
  }
};

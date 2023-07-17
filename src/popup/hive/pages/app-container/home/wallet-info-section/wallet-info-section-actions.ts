import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { ConversionType } from '@popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { PowerType } from '@popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import { TokenOperationType } from '@popup/hive/pages/app-container/home/tokens/token-operation/token-operation.component';
import { Screen } from '@reference-data/screen.enum';
import { IconType, NewIcons } from 'src/common-ui/icons.enum';

export interface ActionButton {
  label: string;
  labelParams?: string[];
  icon: IconType;
  nextScreen: Screen;
  nextScreenParams?: any;
}

export const WalletInfoSectionActions = (
  tokenSymbol: string,
  tokenInfo?: Token,
  tokenBalance?: TokenBalance,
): ActionButton[] => {
  if (tokenSymbol === 'HBD') {
    return [
      {
        label: 'popup_html_send',
        labelParams: ['hbd'],
        icon: NewIcons.SEND,
        nextScreen: Screen.TRANSFER_FUND_PAGE,
        nextScreenParams: { selectedCurrency: 'hbd' },
      },
      {
        label: 'popup_html_convert_hbd',
        icon: NewIcons.CONVERT,
        nextScreen: Screen.CONVERSION_PAGE,
        nextScreenParams: {
          conversionType: ConversionType.CONVERT_HBD_TO_HIVE,
        },
      },
      {
        label: 'popup_html_save_hbd',
        icon: NewIcons.SAVINGS,
        nextScreen: Screen.SAVINGS_PAGE,
        nextScreenParams: { selectedCurrency: 'hbd' },
      },
    ];
  } else if (tokenSymbol === 'HIVE') {
    return [
      {
        label: 'popup_html_send',
        labelParams: ['hive'],
        icon: NewIcons.SEND,
        nextScreen: Screen.TRANSFER_FUND_PAGE,
        nextScreenParams: { selectedCurrency: 'hive' },
      },
      {
        label: 'popup_html_pu',
        icon: NewIcons.POWER_UP,
        nextScreen: Screen.POWER_UP_PAGE,
        nextScreenParams: { powerType: PowerType.POWER_UP },
      },
      {
        label: 'popup_html_convert_hive',
        icon: NewIcons.CONVERT,
        nextScreen: Screen.CONVERSION_PAGE,
        nextScreenParams: {
          conversionType: ConversionType.CONVERT_HIVE_TO_HBD,
        },
      },
      {
        label: 'popup_html_save_hive',
        icon: NewIcons.SAVINGS,
        nextScreen: Screen.SAVINGS_PAGE,
        nextScreenParams: { selectedCurrency: 'hive' },
      },
    ];
  } else if (tokenSymbol === 'HP') {
    return [
      {
        label: 'popup_html_delegate',
        icon: NewIcons.HP_DELEGATION,
        nextScreen: Screen.DELEGATION_PAGE,
      },
      {
        label: 'popup_html_delegate_rc',
        icon: NewIcons.RC_DELEGATION,
        nextScreen: Screen.RC_DELEGATIONS_PAGE,
      },
      {
        label: 'dialog_title_powerdown',
        icon: NewIcons.POWER_DOWN,
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
      icon: NewIcons.SEND,
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
        icon: NewIcons.TOKEN_STAKE,
      });
      actions.push({
        label: 'popup_html_token_unstake',
        nextScreen: Screen.TOKENS_OPERATION,
        nextScreenParams: {
          tokenBalance,
          operationType: TokenOperationType.UNSTAKE,
          tokenInfo: tokenInfo,
        },
        icon: NewIcons.TOKEN_UNSTAKE,
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
        icon: NewIcons.TOKEN_DELEGATION,
      });
    }

    console.log(tokenBalance, tokenInfo, actions);
    return actions;
  }
};

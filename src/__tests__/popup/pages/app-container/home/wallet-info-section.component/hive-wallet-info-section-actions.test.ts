import { Screen } from '@interfaces/screen.interface';
import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import { EVMWalletInfoSectionActions } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-actions';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { HiveWalletInfoSectionActions } from 'src/popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-actions';
import { PortfolioRouteUtils } from '@popup/multichain/utils/portfolio-route.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('hive-wallet-info-section-actions tests:\n', () => {
  it('sets HIVE send label to plain Send', () => {
    const sendAction = HiveWalletInfoSectionActions('HIVE')[0];

    expect(sendAction.nextScreen).toBe(Screen.TRANSFER_FUND_PAGE);
    expect(sendAction.label).toBe('popup_html_send_transfer');
    expect(sendAction.labelParams).toBeUndefined();
    expect(I18nUtils.getMessage(sendAction.label)).toBe('Send');
  });

  it('sets HBD send label to plain Send', () => {
    const sendAction = HiveWalletInfoSectionActions('HBD')[0];

    expect(sendAction.nextScreen).toBe(Screen.TRANSFER_FUND_PAGE);
    expect(sendAction.label).toBe('popup_html_send_transfer');
    expect(sendAction.labelParams).toBeUndefined();
    expect(I18nUtils.getMessage(sendAction.label)).toBe('Send');
  });

  it('adds a portfolio swap action for HIVE and HBD but not HP', () => {
    const hiveSwap = HiveWalletInfoSectionActions('HIVE').find(
      (action) => action.label === 'html_popup_swaps_process_swap',
    );
    const hbdSwap = HiveWalletInfoSectionActions('HBD').find(
      (action) => action.label === 'html_popup_swaps_process_swap',
    );
    const hpSwap = HiveWalletInfoSectionActions('HP').find(
      (action) => action.label === 'html_popup_swaps_process_swap',
    );

    expect(hiveSwap?.icon).toBe(SVGIcons.PORTFOLIO_SWAP);
    expect(hiveSwap?.onClick).toBe(PortfolioRouteUtils.openSwap);
    expect(hbdSwap?.onClick).toBe(PortfolioRouteUtils.openSwap);
    expect(hpSwap).toBeUndefined();
  });

  it('adds a portfolio swap action for Hive Engine tokens', () => {
    const swapAction = HiveWalletInfoSectionActions('BEE').find(
      (action) => action.label === 'html_popup_swaps_process_swap',
    );

    expect(swapAction?.onClick).toBe(PortfolioRouteUtils.openSwap);
  });
});

describe('evm-wallet-info-section-actions', () => {
  it('adds portfolio buy and swap actions for EVM tokens', () => {
    const actions = EVMWalletInfoSectionActions({
      tokenInfo: {
        symbol: 'ETH',
        type: EVMSmartContractType.NATIVE,
      },
    } as unknown as NativeAndErc20Token);

    const buyAction = actions.find(
      (action) => action.label === 'popup_html_buy',
    );
    const swapAction = actions.find(
      (action) => action.label === 'html_popup_swaps_process_swap',
    );

    expect(actions[0].nextScreen).toBe(Screen.TRANSFER_FUND_PAGE);
    expect(buyAction?.icon).toBe(SVGIcons.PORTFOLIO_BUY);
    expect(buyAction?.onClick).toBe(PortfolioRouteUtils.openBuy);
    expect(swapAction?.icon).toBe(SVGIcons.PORTFOLIO_SWAP);
    expect(swapAction?.onClick).toBe(PortfolioRouteUtils.openSwap);
  });
});

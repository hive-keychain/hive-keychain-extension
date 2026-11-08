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
    expect(hbdSwap).toBeDefined();
    expect(hpSwap).toBeUndefined();
  });

  it('opens portfolio swap with the Hive token as the outgoing asset', () => {
    const openSwap = jest
      .spyOn(PortfolioRouteUtils, 'openSwap')
      .mockImplementation(() => undefined);

    HiveWalletInfoSectionActions('HIVE')
      .find((action) => action.label === 'html_popup_swaps_process_swap')
      ?.onClick?.();
    HiveWalletInfoSectionActions('HBD')
      .find((action) => action.label === 'html_popup_swaps_process_swap')
      ?.onClick?.();
    HiveWalletInfoSectionActions('BEE')
      .find((action) => action.label === 'html_popup_swaps_process_swap')
      ?.onClick?.();

    expect(openSwap).toHaveBeenNthCalledWith(1, {
      symbol: 'HIVE',
      ecosystem: 'hive',
    });
    expect(openSwap).toHaveBeenNthCalledWith(2, {
      symbol: 'HBD',
      ecosystem: 'hive',
    });
    expect(openSwap).toHaveBeenNthCalledWith(3, {
      symbol: 'BEE',
      ecosystem: 'hive',
    });
    openSwap.mockRestore();
  });
});

describe('evm-wallet-info-section-actions', () => {
  it('opens portfolio swap with the EVM token as the outgoing asset', () => {
    const openSwap = jest
      .spyOn(PortfolioRouteUtils, 'openSwap')
      .mockImplementation(() => undefined);
    const actions = EVMWalletInfoSectionActions({
      tokenInfo: {
        symbol: 'USDC',
        type: EVMSmartContractType.ERC20,
        chainId: '0x1',
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
    } as unknown as NativeAndErc20Token);

    const buyAction = actions.find(
      (action) => action.label === 'popup_html_buy',
    );
    const swapAction = actions.find(
      (action) => action.label === 'html_popup_swaps_process_swap',
    );

    expect(actions[0].nextScreen).toBe(Screen.TRANSFER_FUND_PAGE);
    expect(buyAction).toBeUndefined();
    expect(swapAction?.icon).toBe(SVGIcons.PORTFOLIO_SWAP);
    swapAction?.onClick?.();
    expect(openSwap).toHaveBeenCalledWith({
      symbol: 'USDC',
      ecosystem: 'evm',
      chainId: '0x1',
      contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    });
    openSwap.mockRestore();
  });

  it('omits a contract address for native EVM tokens', () => {
    const openSwap = jest
      .spyOn(PortfolioRouteUtils, 'openSwap')
      .mockImplementation(() => undefined);
    const swapAction = EVMWalletInfoSectionActions({
      tokenInfo: {
        symbol: 'ETH',
        type: EVMSmartContractType.NATIVE,
        chainId: '0x1',
      },
    } as unknown as NativeAndErc20Token).find(
      (action) => action.label === 'html_popup_swaps_process_swap',
    );

    swapAction?.onClick?.();
    expect(openSwap).toHaveBeenCalledWith({
      symbol: 'ETH',
      ecosystem: 'evm',
      chainId: '0x1',
      contractAddress: undefined,
    });
    openSwap.mockRestore();
  });
});

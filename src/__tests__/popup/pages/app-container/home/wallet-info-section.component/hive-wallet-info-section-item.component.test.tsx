import { Token, TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUtils from 'hive-keychain-commons/lib/utils/images.utils';
import React from 'react';
import { BaseApi } from 'src/api/base';
import { KeychainApi } from 'src/api/keychain';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { WalletInfoSectionItem } from 'src/popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-item/hive-wallet-info-section-item.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/api/keychain', () => ({
  KeychainApi: {
    get: jest.fn(),
  },
}));

jest.mock('src/api/base', () => ({
  BaseApi: {
    get: jest.fn(),
  },
}));

jest.mock('react-svg', () => ({
  ReactSVG: ({
    afterInjection,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    src?: string;
    afterInjection?: unknown;
  }) => <div {...props} />,
}));

jest.mock('src/common-ui/preloaded-image/preloaded-image.component', () => ({
  PreloadedImage: ({
    src,
    useDefaultSVG,
  }: {
    src: string;
    useDefaultSVG?: string;
  }) => (
    <img
      data-testid="token-preloaded-image"
      src={src}
      data-default-svg={useDefaultSVG}
    />
  ),
}));

describe('Hive WalletInfoSectionItem', () => {
  const connectedProps = {
    hive: {},
    pendingUnstaking: [],
    navigateToWithParams: jest.fn(),
  };

  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
    (KeychainApi.get as jest.Mock).mockReset();
    (KeychainApi.get as jest.Mock).mockResolvedValue({
      '24h': [
        ['2026-09-28T00:00:00.000Z', 1],
        ['2026-09-28T01:00:00.000Z', 1.2],
      ],
    });
    (BaseApi.get as jest.Mock).mockReset();
  });

  it('renders native HIVE/HBD/HP logos from bundled SVG files', () => {
    const { rerender } = render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="HIVE"
        icon={SVGIcons.WALLET_HIVE_LOGO}
        mainValue="1.000"
        mainValueLabel="HIVE"
      />,
    );

    const hiveRow = screen.getByTestId('dropdown-arrow-hive');
    expect(
      hiveRow.querySelector('[src="/assets/images/wallet/hive-logo.svg"]'),
    ).toBeTruthy();
    expect(hiveRow.querySelector('[src="wallet/hive-logo"]')).toBeNull();
    expect(screen.queryByTestId('token-preloaded-image')).not.toBeInTheDocument();

    rerender(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="HBD"
        icon={SVGIcons.WALLET_HBD_LOGO}
        mainValue="1.000"
        mainValueLabel="HBD"
      />,
    );
    expect(
      screen
        .getByTestId('dropdown-arrow-hbd')
        .querySelector('[src="/assets/images/wallet/hbd-logo.svg"]'),
    ).toBeTruthy();

    rerender(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="HP"
        icon={SVGIcons.WALLET_HP_LOGO}
        mainValue="1.000"
        mainValueLabel="HP"
      />,
    );
    expect(
      screen
        .getByTestId('dropdown-arrow-hp')
        .querySelector('[src="/assets/images/wallet/hp-logo.svg"]'),
    ).toBeTruthy();
  });

  it('renders Hive Engine token icons through PreloadedImage', () => {
    const tokenIcon =
      'https://s3.amazonaws.com/steem-engine/images/icon_steem-engine_gradient.svg';
    const tokenInfo = {
      name: 'Bee Token',
      symbol: 'BEE',
      metadata: {
        url: 'https://hive-engine.com',
        icon: tokenIcon,
        desc: 'BEE',
      },
    } as Token;
    const tokenBalance = {
      symbol: 'BEE',
      balance: '1',
    } as TokenBalance;

    render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="BEE"
        tokenInfo={tokenInfo}
        tokenBalance={tokenBalance}
        defaultIcon={SVGIcons.HIVE_ENGINE}
        addBackground
        mainValue="1.000"
        mainValueLabel="BEE"
      />,
    );

    const tokenImage = screen.getByTestId('token-preloaded-image');
    expect(tokenImage).toHaveAttribute(
      'src',
      ImageUtils.getImmutableImage(tokenIcon),
    );
    expect(tokenImage).toHaveAttribute('data-default-svg', SVGIcons.HIVE_ENGINE);
    expect(
      screen.queryByTestId('dropdown-arrow-bee'),
    ).not.toBeInTheDocument();
  });

  it('does not request images.hive.blog/0x0/undefined when a token has no icon', () => {
    const tokenInfo = {
      symbol: 'NOICON',
      metadata: {
        url: 'https://example.com',
        desc: 'no icon',
      },
    } as Token;

    render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="NOICON"
        tokenInfo={tokenInfo}
        defaultIcon={SVGIcons.HIVE_ENGINE}
        addBackground
        mainValue="1.000"
        mainValueLabel="NOICON"
      />,
    );

    expect(screen.getByTestId('token-preloaded-image')).toHaveAttribute(
      'src',
      '',
    );
  });

  it('opens the token detail panel instead of expanding the card', async () => {
    const user = userEvent.setup();
    render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="HIVE"
        icon={SVGIcons.WALLET_HIVE_LOGO}
        mainValue="1.000"
        mainValueLabel="HIVE"
      />,
    );

    const disclosure = screen.getByTestId('dropdown-arrow-hive');
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByTestId('wallet-token-detail-panel-HIVE'),
    ).not.toBeInTheDocument();

    await user.click(disclosure);
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByTestId('wallet-token-detail-panel-HIVE'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('wallet-token-detail-panel-HIVE-logo'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('wallet-token-price-chart-HIVE'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('wallet-token-detail-panel-HIVE-footer'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('icon-token-history-HIVE'),
    ).toBeInTheDocument();
    await screen.findByTestId('wallet-token-price-chart-price-HIVE');
    expect(
      screen.queryByTestId('wallet-token-price-chart-category-HIVE-24h'),
    ).not.toBeInTheDocument();
    expect(KeychainApi.get).toHaveBeenCalledWith('hive/v2/price/hive/history');
    expect(
      screen.getByTestId('wallet-token-price-chart-price-HIVE'),
    ).toHaveTextContent('$1.20');
    expect(
      screen.getByTestId('wallet-token-holdings-amount-HIVE'),
    ).toHaveTextContent('1.000 HIVE');
    expect(
      screen.queryByTestId('wallet-token-holdings-usd-HIVE'),
    ).not.toBeInTheDocument();
  });

  it('shows the HIVE balance in token units and USD', async () => {
    const user = userEvent.setup();
    render(
      <WalletInfoSectionItem
        {...connectedProps}
        hive={{ usd: 0.25 }}
        tokenSymbol="HIVE"
        icon={SVGIcons.WALLET_HIVE_LOGO}
        mainValue="4.000"
        mainValueLabel="HIVE"
      />,
    );

    await user.click(screen.getByTestId('dropdown-arrow-hive'));

    expect(
      screen.getByTestId('wallet-token-holdings-amount-HIVE'),
    ).toHaveTextContent('4.000 HIVE');
    expect(screen.getByTestId('wallet-token-holdings-usd-HIVE')).toHaveTextContent(
      '$1.00',
    );
    expect(
      screen.queryByTestId('wallet-token-detail-panel-contract-HIVE'),
    ).not.toBeInTheDocument();
  });

  it('prices HBD from the HBD dollar rate', async () => {
    const user = userEvent.setup();
    render(
      <WalletInfoSectionItem
        {...connectedProps}
        hiveDollar={{ usd: 1 }}
        tokenSymbol="HBD"
        icon={SVGIcons.WALLET_HBD_LOGO}
        mainValue="2.000"
        mainValueLabel="HBD"
      />,
    );

    await user.click(screen.getByTestId('dropdown-arrow-hbd'));
    expect(screen.getByTestId('wallet-token-holdings-usd-HBD')).toHaveTextContent(
      '$2.00',
    );
    await screen.findByTestId('wallet-token-price-chart-price-HBD');
  });

  it('prices a Hive Engine balance from the market and the HIVE dollar rate', async () => {
    const user = userEvent.setup();
    const nowSeconds = Math.floor(Date.now() / 1000);
    (BaseApi.get as jest.Mock).mockResolvedValue([
      { timestamp: nowSeconds - 7200, close: '2' },
      { timestamp: nowSeconds - 3600, close: '4' },
    ]);

    render(
      <WalletInfoSectionItem
        {...connectedProps}
        hive={{ usd: 2 }}
        tokenSymbol="BEE"
        tokenInfo={
          {
            name: 'Bee Token',
            symbol: 'BEE',
            metadata: { url: '', icon: '', desc: '' },
          } as Token
        }
        tokenBalance={
          {
            symbol: 'BEE',
            balance: '2',
          } as TokenBalance
        }
        tokenMarket={[
          {
            symbol: 'BEE',
            highestBid: '1',
            lowestAsk: '1',
            lastPrice: '3',
          } as TokenMarket,
        ]}
        mainValue="2"
        mainValueLabel="BEE"
      />,
    );

    await user.click(screen.getByTestId('token-user-item'));
    expect(
      screen.getByTestId('wallet-token-holdings-amount-BEE'),
    ).toHaveTextContent('2.000 BEE');
    expect(screen.getByTestId('wallet-token-holdings-usd-BEE')).toHaveTextContent(
      '$12.00',
    );
    await screen.findByTestId('wallet-token-price-chart-price-BEE');
  });

  it('loads HBD chart history and skips an empty 24h category', async () => {
    const user = userEvent.setup();
    (KeychainApi.get as jest.Mock).mockResolvedValue({
      '24h': [],
      '7d': [
        ['2026-09-22T00:00:00.000Z', 1],
        ['2026-09-28T00:00:00.000Z', 0.99],
      ],
    });

    render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="HBD"
        icon={SVGIcons.WALLET_HBD_LOGO}
        mainValue="1.000"
        mainValueLabel="HBD"
      />,
    );

    await user.click(screen.getByTestId('dropdown-arrow-hbd'));

    expect(KeychainApi.get).toHaveBeenCalledWith('hive/v2/price/hbd/history');
    expect(
      await screen.findByTestId('wallet-token-price-chart-category-HBD-7d'),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.queryByTestId('wallet-token-price-chart-category-HBD-24h'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('wallet-token-price-chart-price-HBD'),
    ).toHaveTextContent('$0.9900');
  });

  it('loads a Hive Engine chart from hourly closes priced in USD', async () => {
    const user = userEvent.setup();
    const nowSeconds = Math.floor(Date.now() / 1000);
    (KeychainApi.get as jest.Mock).mockResolvedValue({
      '24h': [
        ['2026-09-28T00:00:00.000Z', 1],
        ['2026-09-28T01:00:00.000Z', 1.2],
      ],
      '7d': [
        ['2026-09-22T00:00:00.000Z', 2],
        ['2026-09-28T00:00:00.000Z', 2],
      ],
    });
    (BaseApi.get as jest.Mock).mockResolvedValue([
      { timestamp: nowSeconds - 8 * 24 * 60 * 60, close: '1' },
      { timestamp: nowSeconds - 2 * 24 * 60 * 60, close: '3' },
      { timestamp: nowSeconds - 7200, close: '2' },
      { timestamp: nowSeconds - 3600, close: '4' },
    ]);
    const tokenInfo = {
      name: 'Bee Token',
      symbol: 'BEE',
      metadata: { url: 'https://hive-engine.com', icon: '', desc: 'BEE' },
    } as Token;

    render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="BEE"
        tokenInfo={tokenInfo}
        tokenMarket={[
          {
            symbol: 'BEE',
            highestBid: '1',
            lowestAsk: '1.1',
            lastPrice: '4',
          } as TokenMarket,
        ]}
        defaultIcon={SVGIcons.HIVE_ENGINE}
        mainValue="1.000"
        mainValueLabel="BEE"
      />,
    );

    await user.click(screen.getByTestId('token-user-item'));

    expect(
      screen
        .getByTestId('wallet-token-detail-panel-BEE')
        .querySelector('.wallet-token-detail-panel-title'),
    ).toHaveTextContent('Bee Token');

    expect(BaseApi.get).toHaveBeenCalledWith(
      'https://info-api.tribaldex.com/market/ohlcv?symbol=BEE&interval=hourly',
    );
    expect(KeychainApi.get).toHaveBeenCalledWith('hive/v2/price/hive/history');
    await screen.findByTestId('wallet-token-price-chart-price-BEE');
    expect(
      screen.getByTestId('wallet-token-price-chart-category-BEE-24h'),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByTestId('wallet-token-price-chart-price-BEE'),
    ).toHaveTextContent('$4.80');

    await user.click(
      screen.getByTestId('wallet-token-price-chart-category-BEE-7d'),
    );

    expect(
      screen.getByTestId('wallet-token-price-chart-price-BEE'),
    ).toHaveTextContent('$8.00');
    expect(
      screen.getByTestId('wallet-token-price-chart-change-BEE'),
    ).toHaveTextContent('7d');
  });

  it('loads Hive Power from the Hive price history', async () => {
    const user = userEvent.setup();
    render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="HP"
        icon={SVGIcons.WALLET_HP_LOGO}
        mainValue="1.000"
        mainValueLabel="HP"
      />,
    );

    await user.click(screen.getByTestId('dropdown-arrow-hp'));

    expect(KeychainApi.get).toHaveBeenCalledWith('hive/v2/price/hive/history');
    await screen.findByTestId('wallet-token-price-chart-price-HP');
    expect(
      screen.queryByTestId('wallet-token-price-chart-category-HP-24h'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('wallet-token-price-chart-price-HP'),
    ).toHaveTextContent('$1.20');
  });

  it('shows price history unavailable when the Hive chart request fails', async () => {
    const user = userEvent.setup();
    (KeychainApi.get as jest.Mock).mockRejectedValue(new Error('offline'));

    render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="HIVE"
        icon={SVGIcons.WALLET_HIVE_LOGO}
        mainValue="1.000"
        mainValueLabel="HIVE"
      />,
    );

    await user.click(screen.getByTestId('dropdown-arrow-hive'));

    expect(
      await screen.findByTestId('wallet-token-price-chart-status-HIVE'),
    ).toHaveTextContent('wallet_token_price_unavailable');
  });

  it('skips the Hive Engine chart when the token has no price', async () => {
    const user = userEvent.setup();
    const tokenInfo = {
      name: 'Dust',
      symbol: 'DUST',
      metadata: { url: '', icon: '', desc: 'DUST' },
    } as Token;

    render(
      <WalletInfoSectionItem
        {...connectedProps}
        tokenSymbol="DUST"
        tokenInfo={tokenInfo}
        defaultIcon={SVGIcons.HIVE_ENGINE}
        mainValue="1.000"
        mainValueLabel="DUST"
      />,
    );

    await user.click(screen.getByTestId('token-user-item'));

    expect(screen.getByTestId('wallet-token-detail-panel-DUST')).toHaveClass(
      'is-compact',
    );
    expect(
      screen.queryByTestId('wallet-token-price-chart-DUST'),
    ).not.toBeInTheDocument();
    expect(BaseApi.get).not.toHaveBeenCalled();
    expect(KeychainApi.get).not.toHaveBeenCalled();
  });
});

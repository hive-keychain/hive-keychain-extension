import { Token, TokenBalance } from '@interfaces/tokens.interface';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUtils from 'hive-keychain-commons/lib/utils/images.utils';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { WalletInfoSectionItem } from 'src/popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-item/hive-wallet-info-section-item.component';
import { I18nUtils } from 'src/utils/i18n.utils';

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
  });
});

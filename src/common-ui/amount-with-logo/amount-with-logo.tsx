import { Token } from '@interfaces/tokens.interface';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { ColorsUtils } from 'src/utils/colors.utils';

type Props = {
  amount: string | number;
  icon?: SVGIcons;
  symbol?: string;
  showBorder?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  logoSize?: 'small' | 'medium' | 'large';
  iconPosition?: 'left' | 'right';
  title?: string;
  tokens?: Token[];
};

const AmountWithLogo = ({
  amount,
  icon,
  symbol,
  showBorder = false,
  className = '',
  size = 'medium',
  logoSize = 'medium',
  iconPosition = 'left',
  title,
  tokens,
}: Props) => {
  const [tokenIcon, setTokenIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!icon && symbol) {
      setIsLoading(true);
      ColorsUtils.downloadColors().then(() => {
        TokensUtils.getTokenIcon(symbol, tokens)
          .then((iconUrl) => {
            setTokenIcon(iconUrl);
            setIsLoading(false);
          })
          .catch(() => {
            setTokenIcon(null);
            setIsLoading(false);
          });
      });
    } else {
      setIsLoading(false);
    }
  }, [icon, symbol]);

  const iconElement = icon ? (
    <PreloadedImage
      className="amount-logo"
      src={`/assets/images/icons/${icon}.svg`}
      symbol={symbol}
      addBackground
      useDefaultSVG={icon}
    />
  ) : isLoading ? (
    <div className="amount-logo loading-placeholder" />
  ) : (
    <PreloadedImage
      className="amount-logo"
      symbol={symbol}
      addBackground
      src={tokenIcon || ''}
    />
  );

  const amountElement = (
    <span className="amount">
      {typeof amount === 'string' ? amount.split(' ')[0] : amount} {symbol}
    </span>
  );

  return (
    <div
      className={`amount-with-logo ${
        showBorder ? 'with-border' : ''
      } size-${size} icon-position-${iconPosition} ${className}`}>
      {title && <span className="title">{chrome.i18n.getMessage(title)}</span>}
      <div className="amount-logo-container">
        {iconPosition === 'left' ? (
          <>
            {iconElement}
            {amountElement}
          </>
        ) : (
          <>
            {amountElement}
            {iconElement}
          </>
        )}
      </div>
    </div>
  );
};

export default AmountWithLogo;

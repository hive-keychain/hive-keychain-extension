import { Token } from '@interfaces/tokens.interface';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { ColorsUtils } from 'src/utils/colors.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
type Props = {
  amount: string | number;
  icon?: SVGIcons;
  symbol?: string;
  logoUrl?: string;
  className?: string;
  title?: string;
  tokens?: Token[];
};

const AmountWithLogo = ({
  amount,
  icon,
  symbol,
  logoUrl,
  className = '',
  title,
  tokens,
}: Props) => {
  const [tokenIcon, setTokenIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!icon && !logoUrl && symbol) {
      setIsLoading(true);
      ColorsUtils.downloadColors().then(async () => {
        let tokensList = tokens;
        if (!tokensList) {
          tokensList = await TokensUtils.getAllTokens();
        }
        TokensUtils.getTokenIcon(symbol, tokensList)
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
  ) : (
    <PreloadedImage
      className="amount-logo"
      symbol={symbol}
      addBackground
      src={logoUrl || tokenIcon || ''}
    />
  );

  const amountElement = (
    <span className="amount">
      {typeof amount === 'string' ? amount.split(' ')[0] : amount} {symbol}
    </span>
  );

  return (
    <div className={`amount-with-logo ${className}`}>
      {title && <span className="title">{I18nUtils.getMessage(title)}</span>}
      <div className="amount-logo-container">
        <>
          {amountElement}
          {iconElement}
        </>
      </div>
    </div>
  );
};

export default AmountWithLogo;

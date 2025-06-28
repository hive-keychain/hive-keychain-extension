import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

type Props = {
  amount: string | number;
  icon?: SVGIcons;
  symbol?: string;
  showBorder?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  logoSize?: 'small' | 'medium' | 'large';
  iconPosition?: 'left' | 'right';
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
}: Props) => {
  const iconElement = icon && (
    <PreloadedImage
      className="amount-logo"
      src={`/assets/images/icons/${icon}.svg`}
      useDefaultSVG={icon}
    />
  );

  const amountElement = <span className="amount">{`${amount} ${symbol}`}</span>;

  return (
    <div
      className={`amount-with-logo ${
        showBorder ? 'with-border' : ''
      } size-${size} icon-position-${iconPosition} ${className}`}>
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

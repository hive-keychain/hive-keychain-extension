import React, { useEffect, useState } from 'react';
import { SafeImage } from 'src/common-ui/safe-image/safe-image.component';
import { ColorsUtils } from 'src/utils/colors.utils';
import { ImageUrlUtils } from 'src/utils/image-url.utils';

type Props = {
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
  /** First character used as the letter avatar when no image is available. */
  fallbackLetter?: string;
  /** Full fallback label (e.g. fiat narrow symbol). Takes precedence over fallbackLetter. */
  fallbackText?: string;
  colorKey?: string;
};

export const PortfolioLogoImage = ({
  src,
  className,
  fallbackClassName,
  fallbackLetter = '',
  fallbackText,
  colorKey,
}: Props) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const safeSrc = ImageUrlUtils.getSafeImageUrl(src) ?? '';
  const trimmedFallbackText = fallbackText?.trim() ?? '';
  const letter = trimmedFallbackText || fallbackLetter.slice(0, 1);

  if (!safeSrc || failed) {
    if (!letter) {
      return null;
    }

    const color = ColorsUtils.stringToColor(colorKey ?? letter);
    return (
      <span
        className={fallbackClassName ?? className}
        style={{
          backgroundColor: `${color}2b`,
          color,
        }}>
        {letter}
      </span>
    );
  }

  return (
    <SafeImage
      className={className}
      src={safeSrc}
      alt=""
      onError={() => setFailed(true)}
    />
  );
};

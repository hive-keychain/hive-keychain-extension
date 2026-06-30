import React, { useEffect, useState } from 'react';
import { ColorsUtils } from 'src/utils/colors.utils';

type Props = {
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
  fallbackLetter?: string;
  colorKey?: string;
};

export const PortfolioLogoImage = ({
  src,
  className,
  fallbackClassName,
  fallbackLetter = '',
  colorKey,
}: Props) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const trimmedSrc = src?.trim() ?? '';
  const letter = fallbackLetter.slice(0, 1);

  if (!trimmedSrc || failed) {
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
    <img
      className={className}
      src={trimmedSrc}
      alt=""
      onError={() => setFailed(true)}
    />
  );
};

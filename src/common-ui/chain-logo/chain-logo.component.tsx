import React, { useEffect, useState } from 'react';
import { ColorsUtils } from 'src/utils/colors.utils';

import { getChainInitials } from './chain-logo.utils';

export interface ChainLogoProps {
  chainName: string;
  logoUri?: string | null;
  className?: string;
}

export const ChainLogo = ({ chainName, logoUri, className }: ChainLogoProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const trimmedUri = logoUri?.trim() ?? '';
  const showImage = trimmedUri.length > 0 && !imgFailed;

  useEffect(() => {
    setImgFailed(false);
  }, [trimmedUri]);

  const initials = getChainInitials(chainName);
  const color = ColorsUtils.stringToColor(chainName || initials);

  if (showImage) {
    return (
      <img
        className={className}
        src={trimmedUri}
        alt=""
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      className={[className, 'chain-logo-initials'].filter(Boolean).join(' ')}
      style={{
        backgroundColor: `${color}2b`,
        color,
      }}
      aria-hidden>
      {initials}
    </div>
  );
};

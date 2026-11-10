import React, { useEffect, useState } from 'react';
import { SafeImage } from 'src/common-ui/safe-image/safe-image.component';
import { ColorsUtils } from 'src/utils/colors.utils';
import { ImageUrlUtils } from 'src/utils/image-url.utils';

import { getChainInitials } from './chain-logo.utils';

export interface ChainLogoProps {
  chainName: string;
  logoUri?: string | null;
  className?: string;
}

export const ChainLogo = ({ chainName, logoUri, className }: ChainLogoProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const safeLogoUri = ImageUrlUtils.getSafeImageUrl(logoUri) ?? '';
  const showImage = safeLogoUri.length > 0 && !imgFailed;

  useEffect(() => {
    setImgFailed(false);
  }, [safeLogoUri]);

  const initials = getChainInitials(chainName);
  const color = ColorsUtils.stringToColor(chainName || initials);

  if (showImage) {
    return (
      <SafeImage
        className={className}
        src={safeLogoUri}
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

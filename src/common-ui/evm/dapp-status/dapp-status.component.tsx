import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import React, { useEffect, useState } from 'react';
import { SafeImage } from 'src/common-ui/safe-image/safe-image.component';
import { ImageUrlUtils } from 'src/utils/image-url.utils';

export enum DappStatusEnum {
  SELECTED = 'selected',
  DISCONNECTED = 'disconnected',
  CONNECTED = 'connected',
}

type Props = {
  imageUrl?: string;
  fallbackImageUrl?: string;
  address?: string;
  status?: DappStatusEnum;
  onClick?: () => void;
  ariaLabel?: string;
};
export const DappStatusComponent = ({
  imageUrl,
  fallbackImageUrl,
  status,
  onClick,
  address,
  ariaLabel,
}: Props) => {
  const safeImageUrl = ImageUrlUtils.getSafeImageUrl(imageUrl);
  const safeFallbackImageUrl = ImageUrlUtils.getSafeImageUrl(fallbackImageUrl);
  const [imageSrc, setImageSrc] = useState(
    safeImageUrl || safeFallbackImageUrl,
  );

  useEffect(() => {
    setImageSrc(safeImageUrl || safeFallbackImageUrl);
  }, [safeFallbackImageUrl, safeImageUrl]);

  const handleImageError = () => {
    if (safeFallbackImageUrl && imageSrc !== safeFallbackImageUrl) {
      setImageSrc(safeFallbackImageUrl);
      return;
    }
    setImageSrc(undefined);
  };

  const content = (
    <>
      {address && <EvmAccountImage address={address} />}
      {imageSrc && (
        <SafeImage src={imageSrc} alt="" onError={handleImageError} />
      )}
      {status && <div className={`indicator ${status}`}></div>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="evm-dapp-status-container pointer"
        onClick={onClick}
        aria-label={ariaLabel}>
        {content}
      </button>
    );
  }

  return (
    <div className="evm-dapp-status-container">
      {content}
    </div>
  );
};

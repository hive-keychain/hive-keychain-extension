import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import React, { useEffect, useState } from 'react';

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
  const [imageSrc, setImageSrc] = useState(imageUrl || fallbackImageUrl);

  useEffect(() => {
    setImageSrc(imageUrl || fallbackImageUrl);
  }, [fallbackImageUrl, imageUrl]);

  const handleImageError = () => {
    if (fallbackImageUrl && imageSrc !== fallbackImageUrl) {
      setImageSrc(fallbackImageUrl);
      return;
    }
    setImageSrc(undefined);
  };

  const content = (
    <>
      {address && <EvmAccountImage address={address} />}
      {imageSrc && <img src={imageSrc} alt="" onError={handleImageError} />}
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

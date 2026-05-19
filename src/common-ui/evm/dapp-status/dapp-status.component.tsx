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
};
export const DappStatusComponent = ({
  imageUrl,
  fallbackImageUrl,
  status,
  onClick,
  address,
}: Props) => {
  const [imageSrc, setImageSrc] = useState(imageUrl || fallbackImageUrl);

  useEffect(() => {
    setImageSrc(imageUrl || fallbackImageUrl);
  }, [fallbackImageUrl, imageUrl]);

  const handleOnClick = () => {
    if (onClick) onClick();
  };

  const handleImageError = () => {
    if (fallbackImageUrl && imageSrc !== fallbackImageUrl) {
      setImageSrc(fallbackImageUrl);
      return;
    }
    setImageSrc(undefined);
  };

  return (
    <div
      className={`evm-dapp-status-container ${onClick ? 'pointer' : ''}`}
      onClick={handleOnClick}>
      {address && <EvmAccountImage address={address} />}
      {imageSrc && <img src={imageSrc} onError={handleImageError} />}
      {status && <div className={`indicator ${status}`}></div>}
    </div>
  );
};

import { EvmAccountImage } from '@common-ui/evm/evm-account-image/evm-account-image.component';
import React from 'react';

export enum DappStatusEnum {
  SELECTED = 'selected',
  DISCONNECTED = 'disconnected',
  CONNECTED = 'connected',
}

type Props = {
  imageUrl?: string;
  address?: string;
  status?: DappStatusEnum;
  onClick?: () => void;
};
export const DappStatusComponent = ({
  imageUrl,
  status,
  onClick,
  address,
}: Props) => {
  const handleOnClick = () => {
    if (onClick) onClick();
  };
  return (
    <div className={`evm-dapp-status-container ${onClick ? 'pointer' : ''}`}>
      {address && <EvmAccountImage address={address} />}
      {imageUrl && <img src={imageUrl} onClick={handleOnClick} />}
      {status && <div className={`indicator ${status}`}></div>}
    </div>
  );
};

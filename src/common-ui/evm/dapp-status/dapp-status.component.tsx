import React from 'react';

export enum DappStatusEnum {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  OTHER_ACCOUNT_CONNECTED = 'other_account_connected',
}

type Props = {
  imageUrl?: string;
  svg?: string;
  status: DappStatusEnum;
  onClick?: () => void;
};
export const DappStatusComponent = ({
  imageUrl,
  status,
  onClick,
  svg,
}: Props) => {
  const handleOnClick = () => {
    if (onClick) onClick();
  };
  return (
    <div className={`evm-dapp-status-container ${onClick && 'pointer'}`}>
      {svg && (
        <div
          className="image-container"
          dangerouslySetInnerHTML={{ __html: svg }}
          onClick={handleOnClick}></div>
      )}
      {imageUrl && <img src={imageUrl} onClick={handleOnClick} />}
      <div className={`indicator ${status}`}></div>
    </div>
  );
};

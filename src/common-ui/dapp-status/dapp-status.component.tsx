import React from 'react';

export enum DappStatusEnum {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  OTHER_ACCOUNT_CONNECTED = 'other_account_connected',
}

type Props = {
  imageUrl?: string;
  status: DappStatusEnum;
  onClick?: () => void;
};
export const DappStatusComponent = ({ imageUrl, status, onClick }: Props) => {
  return (
    <div className="evm-dapp-status-container">
      <img
        src={imageUrl}
        onClick={() => {
          if (onClick) onClick();
        }}
      />
      <div className={`indicator ${status}`}></div>
    </div>
  );
};

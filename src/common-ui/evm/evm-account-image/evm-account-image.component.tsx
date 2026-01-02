import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import React from 'react';

interface Props {
  address?: string;
  avatar?: string | null | undefined;
  small?: boolean;
}

export const EvmAccountImage = ({ address, avatar, small }: Props) => {
  const identicon = EvmAddressesUtils.getIdenticonFromAddress(address ?? '');
  return (
    <>
      {avatar && (
        <img
          className={`user-picture no-padding ${small ? 'small' : 'normal'}`}
          src={avatar}
        />
      )}
      {!avatar && address && (
        <div
          className={`user-picture no-padding ${small ? 'small' : 'normal'}`}
          dangerouslySetInnerHTML={{
            __html: identicon.svg,
          }}
          style={{ backgroundColor: 'white' }}></div>
      )}
    </>
  );
};

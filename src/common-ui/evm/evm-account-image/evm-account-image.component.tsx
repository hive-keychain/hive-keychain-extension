import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import React from 'react';

interface Props {
  address?: string;
  avatar?: string | null | undefined;
  small?: boolean;
}

export const EvmAccountImage = ({ address, avatar, small }: Props) => {
  const identicon = EvmAddressesUtils.getIdenticonFromAddress(address ?? '');
  const identiconSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
    identicon.svg,
  )}`;
  return (
    <>
      {avatar && (
        <img
          className={`user-picture no-padding ${small ? 'small' : 'normal'}`}
          src={avatar}
        />
      )}
      {!avatar && address && (
        <img
          className={`user-picture no-padding ${small ? 'small' : 'normal'}`}
          src={identiconSrc}
          style={{ backgroundColor: 'white' }}
        />
      )}
    </>
  );
};

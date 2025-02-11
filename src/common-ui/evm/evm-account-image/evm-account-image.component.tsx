import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import React from 'react';
import sanitizeHtml from 'sanitize-html';

interface Props {
  address: string;
}

export const EvmAccountImage = ({ address }: Props) => {
  return (
    <div
      className="user-picture"
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(
          EvmAddressesUtils.getIdenticonFromAddress(address),
          {
            allowedTags: [
              'svg',
              'g',
              'defs',
              'linearGradient',
              'stop',
              'circle',
              'rect',
            ],
            allowedAttributes: {
              '*': ['x', 'y', 'height', 'width', 'viewBox', 'xmlns', 'fill'],
            },
            parser: {
              lowerCaseAttributeNames: false,
            },
          },
        ),
      }}></div>
  );
};

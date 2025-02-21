import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import React from 'react';
import sanitizeHtml from 'sanitize-html';

interface Props {
  address?: string;
  avatar?: string | null | undefined;
}

export const EvmAccountImage = ({ address, avatar }: Props) => {
  return (
    <>
      {avatar && <img className="user-picture no-padding" src={avatar} />}
      {!avatar && address && (
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
                  '*': [
                    'x',
                    'y',
                    'height',
                    'width',
                    'viewBox',
                    'xmlns',
                    'fill',
                  ],
                },
                parser: {
                  lowerCaseAttributeNames: false,
                },
              },
            ),
          }}></div>
      )}
    </>
  );
};

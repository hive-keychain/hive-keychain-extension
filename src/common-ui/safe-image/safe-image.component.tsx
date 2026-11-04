import React, { ImgHTMLAttributes } from 'react';
import { ImageUrlUtils } from 'src/utils/image-url.utils';

interface Props
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'referrerPolicy' | 'src'
  > {
  src?: string | null;
}

export const SafeImage = ({ src, ...imageProps }: Props) => {
  const safeSrc = ImageUrlUtils.getSafeImageUrl(src);
  if (!safeSrc) {
    return null;
  }

  return (
    <img
      {...imageProps}
      src={safeSrc}
      referrerPolicy="no-referrer"
      decoding={imageProps.decoding ?? 'async'}
    />
  );
};

import React, { useEffect, useState } from 'react';
import { IpfsUtils } from 'src/utils/ipfs.utils';

const NFT_VIDEO_EXTENSION_REGEX = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:[?#]|$)/i;
const NFT_PLACEHOLDER = '/assets/images/placeholder-image.svg';

export const isNftVideoMedia = (src?: string) => {
  return !!src && NFT_VIDEO_EXTENSION_REGEX.test(src);
};

interface Props {
  src?: string;
  className?: string;
}

export const EvmNftMedia = ({ src, className }: Props) => {
  const [hasError, setHasError] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const ipfsGatewayUrls = IpfsUtils.getIpfsGatewayUrls(src);
  const resolvedSrc = ipfsGatewayUrls[gatewayIndex] ?? src;
  const isPlaceholder = hasError || !src || src === NFT_PLACEHOLDER;
  const mediaSrc = isPlaceholder ? NFT_PLACEHOLDER : resolvedSrc;
  const mediaClassName = `nft-media ${className ?? ''} ${
    isPlaceholder ? 'placeholder' : ''
  }`.trim();
  const handleError = () => {
    if (gatewayIndex < ipfsGatewayUrls.length - 1) {
      setGatewayIndex(gatewayIndex + 1);
      return;
    }

    setHasError(true);
  };

  useEffect(() => {
    setHasError(false);
    setGatewayIndex(0);
  }, [src]);

  if (!hasError && isNftVideoMedia(src)) {
    return (
      <video
        className={mediaClassName}
        src={mediaSrc}
        autoPlay
        loop
        ref={(element) => {
          if (element) element.muted = true;
        }}
        playsInline
        onError={handleError}
      />
    );
  }

  return (
    <img
      className={mediaClassName}
      src={mediaSrc}
      onError={handleError}
    />
  );
};

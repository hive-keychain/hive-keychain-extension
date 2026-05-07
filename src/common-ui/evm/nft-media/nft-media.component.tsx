import React, { useState } from 'react';

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
  const mediaSrc = hasError || !src ? NFT_PLACEHOLDER : src;
  const mediaClassName = `nft-media ${className ?? ''} ${
    hasError || !src ? 'placeholder' : ''
  }`.trim();

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
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <img
      className={mediaClassName}
      src={mediaSrc}
      onError={() => setHasError(true)}
    />
  );
};

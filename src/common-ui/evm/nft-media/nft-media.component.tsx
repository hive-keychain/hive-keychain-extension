import React, { useEffect, useRef, useState } from 'react';
import { SafeImage } from 'src/common-ui/safe-image/safe-image.component';
import { ImageUrlUtils } from 'src/utils/image-url.utils';
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
  const directSafeSrc = ImageUrlUtils.getSafeImageUrl(src);
  const [hasError, setHasError] = useState(false);
  const [isResolvingIpfs, setIsResolvingIpfs] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(directSafeSrc);
  const [resolvedGateway, setResolvedGateway] = useState('');
  const excludedGatewaysRef = useRef<string[]>([]);
  const resolutionIdRef = useRef(0);
  const isIpfsMedia = !!IpfsUtils.getIpfsPath(src);
  const isPlaceholder =
    hasError ||
    !src ||
    (!isIpfsMedia && !directSafeSrc) ||
    src === NFT_PLACEHOLDER ||
    isResolvingIpfs;
  const mediaSrc = isPlaceholder ? NFT_PLACEHOLDER : resolvedSrc;
  const mediaClassName = `nft-media ${className ?? ''} ${
    isPlaceholder ? 'placeholder' : ''
  }`.trim();
  const resolveMediaGateway = async (excludedGateways: string[] = []) => {
    if (!src || !isIpfsMedia) return;

    const resolutionId = ++resolutionIdRef.current;
    setIsResolvingIpfs(true);
    try {
      const resolution = await IpfsUtils.resolveIpfsUrl(src, {
        bypassCache: excludedGateways.length > 0,
        excludedGateways,
      });
      if (resolutionId !== resolutionIdRef.current) return;

      const safeResolutionUrl = ImageUrlUtils.getSafeImageUrl(resolution.url);
      if (!safeResolutionUrl) {
        throw new Error('Unsafe IPFS gateway URL');
      }
      setResolvedSrc(safeResolutionUrl);
      setResolvedGateway(resolution.gateway);
      setIsResolvingIpfs(false);
    } catch {
      if (resolutionId !== resolutionIdRef.current) return;

      setIsResolvingIpfs(false);
      setHasError(true);
    }
  };

  const handleError = () => {
    if (isResolvingIpfs) return;

    if (isIpfsMedia && resolvedGateway) {
      IpfsUtils.reportGatewayFailure(resolvedGateway);
      excludedGatewaysRef.current = [
        ...new Set([...excludedGatewaysRef.current, resolvedGateway]),
      ];
      void resolveMediaGateway(excludedGatewaysRef.current);
      return;
    }

    setHasError(true);
  };

  useEffect(() => {
    resolutionIdRef.current += 1;
    excludedGatewaysRef.current = [];
    setHasError(false);
    setResolvedGateway('');
    setResolvedSrc(directSafeSrc);
    setIsResolvingIpfs(isIpfsMedia);
    if (isIpfsMedia) void resolveMediaGateway();

    return () => {
      resolutionIdRef.current += 1;
    };
  }, [src]);

  if (!hasError && isNftVideoMedia(resolvedSrc)) {
    return (
      <video
        className={mediaClassName}
        src={mediaSrc}
        autoPlay
        loop
        ref={(element) => {
          if (!element) return;
          element.muted = true;
          element.setAttribute('referrerpolicy', 'no-referrer');
        }}
        playsInline
        onError={handleError}
      />
    );
  }

  return (
    <SafeImage
      className={mediaClassName}
      src={mediaSrc}
      alt=""
      onError={handleError}
    />
  );
};

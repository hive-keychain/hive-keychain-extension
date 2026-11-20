import { useThemeContext } from '@popup/theme.context';
import React, { useEffect, useRef, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ColorsUtils } from 'src/utils/colors.utils';
import { ImageUrlUtils } from 'src/utils/image-url.utils';

interface PreloadedImageProps {
  className?: string;
  src: string;
  alt?: string;
  placeholder?: string;
  addBackground?: boolean;
  backgroundColor?: string;
  symbol?: string;
  useDefaultSVG?: SVGIcons;
}

const LOADING_PLACEHOLDER_DELAY_MS = 150;

interface ImageLoadState {
  src: string;
  status: 'loading' | 'loaded' | 'error';
}

export const PreloadedImage = ({
  src,
  alt,
  className,
  addBackground,
  placeholder,
  symbol,
  backgroundColor,
  useDefaultSVG,
}: PreloadedImageProps) => {
  const safeSrc = ImageUrlUtils.getSafeImageUrl(src) ?? '';
  const safeAlt = ImageUrlUtils.getSafeImageUrl(alt);
  const safePlaceholder = ImageUrlUtils.getSafeImageUrl(placeholder);
  const safeFallback = safePlaceholder ?? safeAlt;
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoadState, setImageLoadState] = useState<ImageLoadState>({
    src: safeSrc,
    status: 'loading',
  });
  const [loadingPlaceholderSrc, setLoadingPlaceholderSrc] = useState('');
  const [backgroundState, setBackgroundState] = useState({
    src: '',
    value: 'transparent',
  });
  const { theme } = useThemeContext();
  const imageStatus =
    imageLoadState.src === safeSrc ? imageLoadState.status : 'loading';
  const isLoaded = imageStatus === 'loaded';
  const hasError = imageStatus === 'error';
  const background =
    backgroundState.src === safeSrc
      ? backgroundState.value
      : 'transparent';
  const showLoadingPlaceholder =
    imageStatus === 'loading' && loadingPlaceholderSrc === safeSrc;

  useEffect(() => {
    if (!safeSrc || imageStatus !== 'loading') {
      return;
    }
    const timeout = window.setTimeout(() => {
      setLoadingPlaceholderSrc(safeSrc);
    }, LOADING_PLACEHOLDER_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [imageStatus, safeSrc]);

  useEffect(() => {
    if (!isLoaded || !addBackground || !imageRef.current) {
      return;
    }

    const value = backgroundColor
      ? `${backgroundColor}2b`
      : symbol
        ? ColorsUtils.getBackgroundColorFromBackend(symbol, theme)
        : ColorsUtils.getBackgroundColorFromImage(imageRef.current);
    setBackgroundState({ src: safeSrc, value });
  }, [addBackground, backgroundColor, isLoaded, safeSrc, symbol, theme]);

  const handleLoad = () => {
    setImageLoadState({ src: safeSrc, status: 'loaded' });
  };

  const handleError = () => {
    if (addBackground && useDefaultSVG) {
      setBackgroundState({ src: safeSrc, value: '#e31337' });
    }
    setImageLoadState({ src: safeSrc, status: 'error' });
  };

  const errorFallback = (
    <>
      {useDefaultSVG && (
        <SVGIcon
          icon={useDefaultSVG}
          className={`currency-icon is-svg ${
            addBackground ? 'add-background' : ''
          }`}
          background={background}
        />
      )}
      {!useDefaultSVG && safeFallback && (
        <img
          src={safeFallback}
          className={`${className} ${addBackground ? 'add-background' : ''}`}
          style={{ background: background }}
          referrerPolicy="no-referrer"
          decoding="async"
        />
      )}
    </>
  );

  if (!safeSrc) {
    return <>{errorFallback}</>;
  }

  if (hasError) {
    return <>{errorFallback}</>;
  }

  const imageClassName = [
    className,
    addBackground ? 'add-background' : undefined,
    showLoadingPlaceholder ? 'shimmer preloaded-image-loading' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <img
      key={safeSrc}
      ref={imageRef}
      src={safeSrc}
      className={imageClassName}
      style={isLoaded ? { background } : undefined}
      onLoad={handleLoad}
      onError={handleError}
      referrerPolicy="no-referrer"
      decoding="async"
    />
  );
};

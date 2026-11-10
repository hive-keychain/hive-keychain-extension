import { useThemeContext } from '@popup/theme.context';
import React, { useEffect, useMemo, useState } from 'react';
import { Shimmer, Image as ShimmerImage } from 'react-shimmer';
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

function isImageSrcLoadedSync(url: string): boolean {
  if (typeof window === 'undefined' || !url) {
    return false;
  }
  const probe = new Image();
  probe.src = url;
  return probe.complete && probe.naturalWidth > 0;
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
  const [background, setBackground] = useState<string>('transparent');
  const [cachedPathError, setCachedPathError] = useState(false);
  const { theme } = useThemeContext();

  const skipShimmer = useMemo(
    () => isImageSrcLoadedSync(safeSrc),
    [safeSrc],
  );

  useEffect(() => {
    setCachedPathError(false);
  }, [safeSrc]);

  useEffect(() => {
    if (!safeSrc) {
      return;
    }
    let isCancelled = false;
    const existingImg = new Image();
    existingImg.referrerPolicy = 'no-referrer';

    const setBackgroundColor = (img: HTMLImageElement) => {
      if (!addBackground || isCancelled) {
        return;
      }

      if (backgroundColor) {
        setBackground(`${backgroundColor}2b`);
      } else if (symbol) {
        setBackground(ColorsUtils.getBackgroundColorFromBackend(symbol, theme));
      } else {
        setBackground(ColorsUtils.getBackgroundColorFromImage(img));
      }
    };

    // Check if image is already cached/loaded
    existingImg.onerror = () => {
      // Dont display errors
    };
    existingImg.src = safeSrc;

    if (existingImg.complete) {
      if (existingImg.naturalWidth > 0) {
        setBackgroundColor(existingImg);
      }
      return () => {
        isCancelled = true;
        existingImg.onerror = null;
      };
    }

    // Image not cached, proceed with normal preloading
    const img = new Image();
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      setBackgroundColor(img);
    };
    img.onerror = () => {
      if (isCancelled) {
        return;
      }
      if (addBackground && useDefaultSVG) {
        setBackground('#e31337');
        return;
      }
      if (safeAlt) {
        img.src = safeAlt;
      }
    };
    img.src = safeSrc;

    return () => {
      isCancelled = true;
      existingImg.onerror = null;
      img.onload = null;
      img.onerror = null;
    };
  }, [
    addBackground,
    backgroundColor,
    safeAlt,
    safeSrc,
    symbol,
    theme,
    useDefaultSVG,
  ]);

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
      {!useDefaultSVG && safePlaceholder && (
        <img
          src={safePlaceholder}
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

  if (skipShimmer) {
    if (cachedPathError) {
      return <>{errorFallback}</>;
    }
    return (
      <img
        src={safeSrc}
        className={`${className} ${addBackground ? 'add-background' : ''}`}
        style={{ background: background }}
        onError={() => setCachedPathError(true)}
        referrerPolicy="no-referrer"
        decoding="async"
      />
    );
  }

  return (
    <>
      <ShimmerImage
        src={safeSrc}
        fallback={
          <Shimmer
            width={300}
            height={300}
            className={className}
            backgroundColor={background}
          />
        }
        NativeImgProps={{
          className: `${className} ${addBackground ? 'add-background' : ''}`,
          style: { background: background },
          referrerPolicy: 'no-referrer',
          decoding: 'async',
        }}
        errorFallback={() => errorFallback}
      />
    </>
  );
};

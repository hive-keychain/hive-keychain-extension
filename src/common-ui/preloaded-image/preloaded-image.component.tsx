import { useThemeContext } from '@popup/theme.context';
import React, { useEffect, useState } from 'react';
import { Shimmer, Image as ShimmerImage } from 'react-shimmer';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ColorsUtils } from 'src/utils/colors.utils';

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
  const [background, setBackground] = useState<string>('transparent');
  const { theme } = useThemeContext();

  useEffect(() => {
    if (!src) {
      return;
    }
    let isCancelled = false;
    const existingImg = new Image();

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
    existingImg.src = src;

    if (existingImg.complete) {
      // Image is already cached, use it directly
      setBackgroundColor(existingImg);
      return () => {
        isCancelled = true;
        existingImg.onerror = null;
      };
    }

    // Image not cached, proceed with normal preloading
    const img = new Image();

    img.onload = () => {
      setBackgroundColor(img);
    };
    img.onerror = () => {
      if (isCancelled) {
        return;
      }
      if (addBackground && useDefaultSVG) {
        setBackground('#e31337');
      } else {
        img.src = alt ?? '';
      }
    };
    img.src = src;

    return () => {
      isCancelled = true;
      existingImg.onerror = null;
      img.onload = null;
      img.onerror = null;
    };
  }, [
    addBackground,
    alt,
    backgroundColor,
    src,
    symbol,
    theme,
    useDefaultSVG,
  ]);

  return (
    <>
      <ShimmerImage
        src={src}
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
        }}
        errorFallback={() => (
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
            {!useDefaultSVG && placeholder && (
              <img
                src={placeholder}
                className={`${className} ${
                  addBackground ? 'add-background' : ''
                }`}
                style={{ background: background }}
              />
            )}
          </>
        )}
      />
    </>
  );
};

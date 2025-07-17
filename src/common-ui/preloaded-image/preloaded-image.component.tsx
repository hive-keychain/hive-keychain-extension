import { useThemeContext } from '@popup/theme.context';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ColorsUtils } from 'src/utils/colors.utils';

interface PreloadedImageProps {
  className?: string;
  src: string;
  alt?: string;
  placeholder?: string;
  addBackground?: boolean;
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
  useDefaultSVG,
}: PreloadedImageProps) => {
  const [image, setImage] = useState<HTMLImageElement>();
  const [background, setBackground] = useState<string>('transparent');
  const { theme } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return function cleanup() {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (mounted) preload();
  }, [src, mounted]);

  const preload = () => {
    // Check if image is already cached/loaded
    const existingImg = new Image();
    existingImg.src = src;

    if (existingImg.complete) {
      // Image is already cached, use it directly
      if (addBackground) {
        if (symbol) {
          setBackground(
            ColorsUtils.getBackgroundColorFromBackend(symbol, theme),
          );
        } else {
          setBackground(ColorsUtils.getBackgroundColorFromImage(existingImg));
        }
      }
      setImage(existingImg);
      return;
    }

    // Image not cached, proceed with normal preloading
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (addBackground) {
        if (symbol) {
          setBackground(
            ColorsUtils.getBackgroundColorFromBackend(symbol, theme),
          );
        } else {
          setBackground(ColorsUtils.getBackgroundColorFromImage(img));
        }
      }
      setImage(img);
    };
    img.onerror = () => {
      if (addBackground && useDefaultSVG) {
        setBackground('#e31337');
      } else {
        img.src = alt ?? '';
      }
    };
  };

  return (
    <>
      {image && image.src && (
        <img
          src={image.src}
          className={`${className} ${addBackground ? 'add-background' : ''}`}
          style={{ background: background }}
        />
      )}
      {!image?.src && useDefaultSVG && (
        <SVGIcon
          icon={useDefaultSVG}
          className={`currency-icon is-svg ${
            addBackground ? 'add-background' : ''
          }`}
          background={background}
        />
      )}
      {!image && placeholder && (
        <img
          src={placeholder}
          className={`${className} ${addBackground ? 'add-background' : ''}`}
          style={{ background: background }}
        />
      )}
    </>
  );
};

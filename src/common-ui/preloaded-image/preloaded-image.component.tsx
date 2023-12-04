import React, { useEffect, useState } from 'react';
import { ColorsUtils } from 'src/utils/colors.utils';

interface PreloadedImageProps {
  className?: string;
  src: string;
  alt?: string;
  placeholder?: string;
  addBackground?: boolean;
}

export const PreloadedImage = ({
  src,
  alt,
  className,
  addBackground,
  placeholder,
}: PreloadedImageProps) => {
  const [image, setImage] = useState<HTMLImageElement>();
  const [background, setBackground] = useState<string>('transparent');

  useEffect(() => {
    preload();
  }, [src]);

  const preload = () => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (addBackground) {
        setBackground(ColorsUtils.getBackgroundColorFromImage(img));
      }
      setImage(img);
    };
    img.onerror = () => {
      img.src = alt ?? '';
    };
  };

  return (
    <>
      {image && (
        <img
          src={image.src}
          className={`${className} ${addBackground ? 'add-background' : ''}`}
          style={{ background: background }}
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

import { Theme, ThemeOpacity } from '@popup/theme.context';
import { KeychainApi } from 'src/api/keychain';
import { ImageUrlUtils } from 'src/utils/image-url.utils';

let imgColors: any = {};
let loaded = false;
const COLOR_SAMPLE_MAX_DIMENSION = 32;
const COLOR_SAMPLE_MAX_SOURCE_DIMENSION = 512;
const FALLBACK_IMAGE_BACKGROUND = '#0000002b';
const componentToHex = (c: any) => {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
};

const rgbToHex = (r: any, g: any, b: any) => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

const getBackgroundColor = (src: string) => {
  const safeSrc = ImageUrlUtils.getSafeImageUrl(src);
  if (!safeSrc) {
    return FALLBACK_IMAGE_BACKGROUND;
  }

  var img = new Image();
  img.referrerPolicy = 'no-referrer';
  img.onerror = () => {
    img.onerror = null;
    img.src = '/assets/images/hive-engine.svg';
  };
  img.src = safeSrc;
  return getBackgroundColorFromImage(img);
};

const downloadColors = async () => {
  if (loaded) return;
  imgColors = await KeychainApi.get('hive/tokensBackgroundColors');
  loaded = true;
};

const getBackgroundColorFromBackend = (symbol: string, theme: Theme) => {
  return imgColors ? imgColors[symbol] + ThemeOpacity[theme] : '00FFFFFF';
};

const getBackgroundColorFromImage = (img: HTMLImageElement) => {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  if (!context) return FALLBACK_IMAGE_BACKGROUND;

  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    sourceWidth > COLOR_SAMPLE_MAX_SOURCE_DIMENSION ||
    sourceHeight > COLOR_SAMPLE_MAX_SOURCE_DIMENSION
  ) {
    return FALLBACK_IMAGE_BACKGROUND;
  }

  const scale = Math.min(
    1,
    COLOR_SAMPLE_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight),
  );
  const sampleWidth = Math.max(1, Math.round(sourceWidth * scale));
  const sampleHeight = Math.max(1, Math.round(sourceHeight * scale));

  try {
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    context.drawImage(img, 0, 0, sampleWidth, sampleHeight);
    var imageData = context.getImageData(0, 0, sampleWidth, sampleHeight);
  } catch (err) {
    return FALLBACK_IMAGE_BACKGROUND;
  }
  var data = imageData.data;

  // Initialize variables
  var colorFrequency: any = {};
  var dominantColor = '';
  var maxFrequency = 0;

  // Loop through the image data
  for (var j = 0; j < data.length; j += 4) {
    var red = data[j];
    var green = data[j + 1];
    var blue = data[j + 2];

    if (red >= 200 && green >= 200 && blue >= 200) continue;

    // Convert the RGB values to a hex code
    var color = rgbToHex(red, green, blue);
    if (color === '#ffffff' || color === '#000000') continue;
    // Check if the color is already in the colorFrequency object
    if (colorFrequency[color]) {
      colorFrequency[color]++;
    } else {
      colorFrequency[color] = 1;
    }
  }
  // Get the dominant color from the color frequency object
  for (var color in colorFrequency) {
    if (colorFrequency[color] > maxFrequency) {
      maxFrequency = colorFrequency[color];
      dominantColor = color;
    }
  }
  return `${dominantColor}2b`;
};

const stringToColor = (str: string) => {
  let hash = 0;
  str.split('').forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, '0');
  }
  return colour;
};

export const ColorsUtils = {
  getBackgroundColor,
  getBackgroundColorFromImage,
  getBackgroundColorFromBackend,
  downloadColors,
  stringToColor,
};

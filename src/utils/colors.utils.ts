const componentToHex = (c: any) => {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
};

const rgbToHex = (r: any, g: any, b: any) => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

const getBackgroundColor = (src: string) => {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  if (!context) return '#0000002b';
  var img = new Image();
  img.onerror = () => {
    img.onerror = null;
    img.src = '/assets/images/hive-engine.svg';
  };
  img.src = src;
  canvas.width = img.width;
  canvas.height = img.height;
  context?.drawImage(img, 0, 0, img.width, img.height);

  // Get the image data
  try {
    var imageData = context.getImageData(0, 0, img.width, img.height);
  } catch (err) {
    return '#0000002b';
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

export const ColorsUtils = {
  getBackgroundColor,
};

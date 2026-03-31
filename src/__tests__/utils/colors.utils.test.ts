import { Theme } from '@popup/theme.context';
import { KeychainApi } from '@api/keychain';
import { ColorsUtils } from 'src/utils/colors.utils';

jest.mock('@api/keychain', () => ({
  KeychainApi: {
    get: jest.fn(),
  },
}));

describe('colors.utils', () => {
  const originalCreateElement = document.createElement.bind(document);

  afterEach(() => {
    document.createElement = originalCreateElement;
    jest.restoreAllMocks();
  });

  describe('getBackgroundColorFromBackend', () => {
    it('concatenates backend color with theme opacity after downloadColors', async () => {
      (KeychainApi.get as jest.Mock).mockResolvedValueOnce({
        MYTOKEN: 'AABBCC',
      });
      await ColorsUtils.downloadColors();
      expect(ColorsUtils.getBackgroundColorFromBackend('MYTOKEN', Theme.LIGHT)).toBe(
        'AABBCC2b',
      );
      expect(ColorsUtils.getBackgroundColorFromBackend('MYTOKEN', Theme.DARK)).toBe(
        'AABBCC33',
      );
    });
  });

  describe('getBackgroundColorFromImage', () => {
    it('returns default when canvas context is missing', () => {
      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return { getContext: () => null } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      });
      const img = { width: 2, height: 2 } as HTMLImageElement;
      expect(ColorsUtils.getBackgroundColorFromImage(img)).toBe('#0000002b');
    });

    it('returns default when getImageData throws (e.g. tainted canvas)', () => {
      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => ({
              drawImage: jest.fn(),
              getImageData: () => {
                throw new Error('SecurityError');
              },
            }),
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      });
      const img = { width: 1, height: 1 } as HTMLImageElement;
      expect(ColorsUtils.getBackgroundColorFromImage(img)).toBe('#0000002b');
    });

    it('returns dominant hex color with light theme opacity suffix', () => {
      const data = new Uint8ClampedArray(4);
      data[0] = 100;
      data[1] = 80;
      data[2] = 60;
      data[3] = 255;

      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') {
          return {
            width: 1,
            height: 1,
            getContext: () => ({
              drawImage: jest.fn(),
              getImageData: () => ({ data }),
            }),
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tagName);
      });

      const img = { width: 1, height: 1 } as HTMLImageElement;
      expect(ColorsUtils.getBackgroundColorFromImage(img)).toBe('#64503c2b');
    });
  });
});

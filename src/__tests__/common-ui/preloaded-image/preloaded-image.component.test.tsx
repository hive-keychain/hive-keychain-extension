import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ icon }: { icon: string }) => (
    <div data-testid="fallback-svg" data-icon={icon} />
  ),
}));

describe('preloaded-image.component', () => {
  const hasUnmountedStateUpdateWarning = (
    consoleError: jest.SpyInstance<void, any[]>,
  ) =>
    consoleError.mock.calls.some((call) =>
      call.some(
        (arg) =>
          typeof arg === 'string' &&
          arg.includes(
            "Can't perform a React state update on an unmounted component",
          ),
      ),
    );

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('ignores pending image callbacks after unmount', () => {
    const OriginalImage = global.Image;
    const createdImages: Array<{
      complete: boolean;
      onload: null | (() => void);
      onerror: null | (() => void);
      _src?: string;
    }> = [];

    class MockImage {
      complete = false;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      _src?: string;

      set src(value: string) {
        this._src = value;
      }

      get src() {
        return this._src ?? '';
      }

      constructor() {
        createdImages.push(this);
      }
    }

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: MockImage,
    });

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(
      <PreloadedImage src="https://images.hive.blog/u/test/avatar" />,
    );

    unmount();

    act(() => {
      createdImages.forEach((image) => {
        image.onload?.();
        image.onerror?.();
      });
    });

    expect(hasUnmountedStateUpdateWarning(consoleError)).toBe(false);

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: OriginalImage,
    });
  });

  it('shows the default svg without fetching when src is empty', () => {
    const OriginalImage = global.Image;
    const ImageSpy = jest.fn();

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: ImageSpy,
    });

    render(
      <PreloadedImage src="" useDefaultSVG={SVGIcons.HIVE_ENGINE} />,
    );

    expect(ImageSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('fallback-svg')).toHaveAttribute(
      'data-icon',
      SVGIcons.HIVE_ENGINE,
    );

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: OriginalImage,
    });
  });

  it('does not retry an empty alt after a load error', () => {
    const OriginalImage = global.Image;
    const createdImages: Array<{
      complete: boolean;
      naturalWidth: number;
      onload: null | (() => void);
      onerror: null | (() => void);
      _src?: string;
    }> = [];

    class MockImage {
      complete = false;
      naturalWidth = 0;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      _src?: string;

      set src(value: string) {
        this._src = value;
      }

      get src() {
        return this._src ?? '';
      }

      constructor() {
        createdImages.push(this);
      }
    }

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: MockImage,
    });

    render(
      <PreloadedImage src="https://images.hive.blog/u/missing/avatar" />,
    );

    act(() => {
      createdImages.forEach((image) => {
        image.onerror?.();
      });
    });

    expect(createdImages.some((image) => image._src === '')).toBe(false);
    expect(
      createdImages.some(
        (image) => image._src === 'https://images.hive.blog/u/missing/avatar',
      ),
    ).toBe(true);

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: OriginalImage,
    });
  });
});

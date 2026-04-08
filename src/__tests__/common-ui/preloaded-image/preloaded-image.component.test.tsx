import '@testing-library/jest-dom';
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

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
});

import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ icon }: { icon: string }) => (
    <div data-testid="fallback-svg" data-icon={icon} />
  ),
}));

describe('preloaded-image.component', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    cleanup();
  });

  it('does not flash the loading placeholder when an image loads quickly', () => {
    jest.useFakeTimers();
    const { container } = render(
      <PreloadedImage src="https://images.hive.blog/u/test/avatar" />,
    );
    const image = container.querySelector('img')!;

    expect(image).not.toHaveClass('preloaded-image-loading');
    fireEvent.load(image);

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(image).not.toHaveClass('preloaded-image-loading');
  });

  it('shows delayed loading feedback for a slow image and removes it on load', () => {
    jest.useFakeTimers();
    const { container } = render(
      <PreloadedImage
        className="user-avatar"
        src="https://images.hive.blog/u/test/avatar"
      />,
    );
    const image = container.querySelector('img')!;

    expect(image).not.toHaveClass('preloaded-image-loading');
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(image).toHaveClass(
      'user-avatar',
      'shimmer',
      'preloaded-image-loading',
    );

    fireEvent.load(image);
    expect(image).not.toHaveClass('shimmer', 'preloaded-image-loading');
  });

  it('clears the delayed loading feedback timer after unmount', () => {
    jest.useFakeTimers();
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { unmount } = render(
      <PreloadedImage src="https://images.hive.blog/u/test/avatar" />,
    );

    unmount();
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(consoleError).not.toHaveBeenCalled();
  });

  it('does not create separate image probes or preloaders', () => {
    const OriginalImage = global.Image;
    const ImageSpy = jest.fn();

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: ImageSpy,
    });

    render(<PreloadedImage src="https://images.hive.blog/u/test/avatar" />);

    expect(ImageSpy).not.toHaveBeenCalled();

    Object.defineProperty(global, 'Image', {
      configurable: true,
      writable: true,
      value: OriginalImage,
    });
  });

  it('shows the default svg without fetching when src is empty', () => {
    render(<PreloadedImage src="" useDefaultSVG={SVGIcons.HIVE_ENGINE} />);

    expect(screen.getByTestId('fallback-svg')).toHaveAttribute(
      'data-icon',
      SVGIcons.HIVE_ENGINE,
    );
  });

  it('shows the safe fallback image after a load error', () => {
    const { container } = render(
      <PreloadedImage
        src="https://images.hive.blog/u/missing/avatar"
        placeholder="/assets/images/accounts.png"
      />,
    );

    fireEvent.error(container.querySelector('img')!);

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/assets/images/accounts.png',
    );
  });
});

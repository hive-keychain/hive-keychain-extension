import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  HIVE_CONTACT_FALLBACK_IMAGE,
  UsernameAvatar,
} from 'src/common-ui/username-with-avatar/username-with-avatar';

jest.mock('src/common-ui/preloaded-image/preloaded-image.component', () => ({
  PreloadedImage: ({ placeholder }: { placeholder?: string }) => (
    <img alt="avatar" src={placeholder} />
  ),
}));

describe('username-with-avatar', () => {
  it('uses the Hive contact fallback image when provided', () => {
    render(
      <UsernameAvatar
        username="missing-account"
        fallbackImage={HIVE_CONTACT_FALLBACK_IMAGE}
      />,
    );

    expect(screen.getByAltText('avatar')).toHaveAttribute(
      'src',
      HIVE_CONTACT_FALLBACK_IMAGE,
    );
  });
});

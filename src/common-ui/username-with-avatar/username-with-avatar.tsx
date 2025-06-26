import React from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

type Props = {
  username: string;
  showBorder?: boolean;
  className?: string;
};

const UsernameWithAvatar = ({
  username,
  showBorder = false,
  className = '',
}: Props) => {
  return (
    <div
      className={`username-with-avatar ${
        showBorder ? 'with-border' : ''
      } ${className}`}>
      <PreloadedImage
        className="user-avatar"
        src={`https://images.hive.blog/u/${username}/avatar`}
        alt={'/assets/images/accounts.png'}
        placeholder={'/assets/images/accounts.png'}
      />
      <span className="username">{username}</span>
    </div>
  );
};

export default UsernameWithAvatar;

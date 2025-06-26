import React from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

type Props = {
  username: string;
  title?: string;
  showBorder?: boolean;
  className?: string;
};

const UsernameWithAvatar = ({
  username,
  title,
  showBorder = false,
  className = '',
}: Props) => {
  return (
    <div
      className={`username-with-avatar ${
        showBorder ? 'with-border' : ''
      } ${className}`}>
      {title && <span className="title">{chrome.i18n.getMessage(title)}</span>}
      <div className="avatar-username-container">
        <PreloadedImage
          className="user-avatar"
          src={`https://images.hive.blog/u/${username}/avatar`}
          alt={'/assets/images/accounts.png'}
          placeholder={'/assets/images/accounts.png'}
        />
        <span className="username">{username}</span>
      </div>
    </div>
  );
};

export default UsernameWithAvatar;

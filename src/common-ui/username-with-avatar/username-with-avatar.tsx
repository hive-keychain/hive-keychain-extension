import React from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

type Props = {
  username: string;
  title?: string;
  showBorder?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  avatarPosition?: 'left' | 'right';
};

const UsernameWithAvatar = ({
  username,
  title,
  showBorder = false,
  className = '',
  size = 'medium',
  avatarPosition = 'left',
}: Props) => {
  const formattedUsername = username.startsWith('@')
    ? username.slice(1).trim()
    : username.trim();

  const avatarElement = (
    <PreloadedImage
      className="user-avatar"
      src={`https://images.hive.blog/u/${formattedUsername}/avatar`}
      alt={'/assets/images/accounts.png'}
      placeholder={'/assets/images/accounts.png'}
    />
  );

  const usernameElement = <span className="username">{formattedUsername}</span>;

  return (
    <div
      className={`username-with-avatar ${
        showBorder ? 'with-border' : ''
      } size-${size} avatar-position-${avatarPosition} ${className}`}>
      {title && <span className="title">{chrome.i18n.getMessage(title)}</span>}
      <div className="avatar-username-container">
        {avatarPosition === 'left' ? (
          <>
            {avatarElement}
            {usernameElement}
          </>
        ) : (
          <>
            {usernameElement}
            {avatarElement}
          </>
        )}
      </div>
    </div>
  );
};

export default UsernameWithAvatar;

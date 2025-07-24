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
  avatarPosition = 'right',
}: Props) => {
  const formattedUsername = username.startsWith('@')
    ? username.trim()
    : `@${username.trim()}`;

  const usernameElement = <span className="username">{formattedUsername}</span>;

  return (
    <div
      className={`username-with-avatar ${
        showBorder ? 'with-border' : ''
      } avatar-position-${avatarPosition} ${className}`}>
      {title && <span className="title">{chrome.i18n.getMessage(title)}</span>}
      <div className="avatar-username-container">
        {avatarPosition === 'left' ? (
          <>
            <UsernameAvatar username={formattedUsername.slice(1)} />
            {usernameElement}
          </>
        ) : (
          <>
            {usernameElement}
            <UsernameAvatar username={formattedUsername.slice(1)} />
          </>
        )}
      </div>
    </div>
  );
};

export const UsernameAvatar = ({ username }: { username: string }) => {
  return (
    <PreloadedImage
      className="user-avatar"
      src={`https://images.hive.blog/u/${username}/avatar`}
      alt={'/assets/images/accounts.png'}
      placeholder={'/assets/images/accounts.png'}
      addBackground
    />
  );
};

export default UsernameWithAvatar;

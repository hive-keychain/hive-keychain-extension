import React from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

type Props = {
  username: string;
  title?: string;
  className?: string;
};

const UsernameWithAvatar = ({ username, title, className = '' }: Props) => {
  const formattedUsername = username.startsWith('@')
    ? username.trim()
    : `@${username.trim()}`;

  const usernameElement = <span className="username">{formattedUsername}</span>;

  return (
    <div className={`username-with-avatar ${className}`}>
      {title && <span className="title">{chrome.i18n.getMessage(title)}</span>}
      <div className="avatar-username-container">
        <>
          {usernameElement}
          <UsernameAvatar username={formattedUsername.slice(1)} />
        </>
      </div>
    </div>
  );
};

export const UsernameAvatar = ({
  username,
  className = '',
}: {
  username: string;
  className?: string;
}) => {
  return (
    <PreloadedImage
      className={`user-avatar ${className}`}
      src={`https://images.hive.blog/u/${username}/avatar`}
      alt={'/assets/images/accounts.png'}
      placeholder={'/assets/images/accounts.png'}
      addBackground
    />
  );
};

export default UsernameWithAvatar;

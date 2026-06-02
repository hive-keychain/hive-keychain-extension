import React from 'react';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';

export const HIVE_CONTACT_FALLBACK_IMAGE =
  'https://images.hive.blog/p/X37EMQ9WSwsMkbaFFVtss2tEEKpVvbqx1wBjz6fCwXa41QNVwbz8YG8D7SsNDaVSpEJmfwUkNU9b82DE4zrWrusmgafrs2L25RaS7?width=128&height=128';

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
  fallbackImage = '/assets/images/accounts.png',
}: {
  username: string;
  className?: string;
  fallbackImage?: string;
}) => {
  return (
    <PreloadedImage
      className={`user-avatar ${className}`}
      src={`https://images.hive.blog/u/${username}/avatar`}
      alt={fallbackImage}
      placeholder={fallbackImage}
      addBackground
    />
  );
};

export default UsernameWithAvatar;

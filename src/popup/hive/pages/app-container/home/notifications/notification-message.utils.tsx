import React, { ReactNode } from 'react';

export const NOTIFICATION_LINK_PLACEHOLDER = '{link}';

export const renderLocalizedNotificationMessage = (
  localizedMessage: string,
  link?: ReactNode,
) => {
  if (!link) return localizedMessage;

  const parts = localizedMessage.split(NOTIFICATION_LINK_PLACEHOLDER);
  if (parts.length !== 2) return localizedMessage;

  return (
    <>
      {parts[0]}
      {link}
      {parts[1]}
    </>
  );
};

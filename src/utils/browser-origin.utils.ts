const getUrl = (url?: string): URL | null => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin === 'null' ? null : parsedUrl;
  } catch {
    return null;
  }
};

export const getOriginFromUrl = (url?: string): string | null => {
  return getUrl(url)?.origin ?? null;
};

export const getHostnameFromUrl = (url?: string): string | null => {
  return getUrl(url)?.hostname ?? null;
};

type MessageSenderLike = Pick<chrome.runtime.MessageSender, 'tab'> & {
  origin?: string;
  url?: string;
};

export const getOriginFromMessageSender = (
  sender: MessageSenderLike,
): string | null => {
  return (
    getOriginFromUrl(sender.origin) ??
    getOriginFromUrl(sender.url) ??
    getOriginFromUrl(sender.tab?.url)
  );
};

export const getHostnameFromMessageSender = (
  sender: MessageSenderLike,
): string | null => {
  return (
    getHostnameFromUrl(sender.origin) ??
    getHostnameFromUrl(sender.url) ??
    getHostnameFromUrl(sender.tab?.url)
  );
};

export const getWindowOrigin = (): string => {
  return window.location.origin;
};

export const getWindowHostname = (): string => {
  return window.location.hostname;
};

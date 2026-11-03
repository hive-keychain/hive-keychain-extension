const isInternalExtensionSender = (
  sender: Pick<chrome.runtime.MessageSender, 'id' | 'url'>,
): boolean => {
  return (
    sender.id === chrome.runtime.id &&
    typeof sender.url === 'string' &&
    sender.url.startsWith(chrome.runtime.getURL(''))
  );
};

export const RuntimeMessageSenderUtils = { isInternalExtensionSender };

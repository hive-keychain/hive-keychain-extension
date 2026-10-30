import {
  getOriginFromMessageSender,
} from 'src/utils/browser-origin.utils';

export type PendingRequestChain = 'hive' | 'evm';

export type PendingRequestSource = {
  tab: number;
  frameId: number;
  documentId?: string;
  origin: string;
};

export type PendingRequestLocator = PendingRequestSource & {
  requestId: number;
};

export type PendingRequestWithSource<T> = T & {
  requestSource?: PendingRequestSource;
};

export const getPendingRequestSource = (
  sender: chrome.runtime.MessageSender,
): PendingRequestSource | null => {
  const tab = sender.tab?.id;
  const origin = getOriginFromMessageSender(sender);

  if (tab === undefined || !origin) {
    return null;
  }

  return {
    tab,
    frameId: sender.frameId ?? 0,
    ...(sender.documentId ? { documentId: sender.documentId } : {}),
    origin,
  };
};

export const getPendingRequestLocator = (
  requestId: number,
  source: PendingRequestSource,
): PendingRequestLocator => ({ requestId, ...source });

export const isPendingRequestSourceMatch = (
  left: PendingRequestSource,
  right: PendingRequestSource,
) => {
  if (
    left.tab !== right.tab ||
    left.frameId !== right.frameId ||
    left.origin !== right.origin
  ) {
    return false;
  }

  if (left.documentId && right.documentId) {
    return left.documentId === right.documentId;
  }

  return true;
};

export const getPendingRequestMessageOptions = (
  source?: PendingRequestSource,
): chrome.tabs.MessageSendOptions | undefined => {
  if (!source) return undefined;

  return {
    frameId: source.frameId,
    ...(!process.env.IS_FIREFOX && source.documentId
      ? { documentId: source.documentId }
      : {}),
  };
};


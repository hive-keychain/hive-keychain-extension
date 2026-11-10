import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { syncSharedDialogWindow } from '@background/multichain/dialog-coordinator';

let isRegistered = false;

const cleanup = async (
  remove: (
    hiveRequestHandler: HiveRequestsHandler,
    evmRequestHandler: EvmRequestHandler,
  ) => Promise<number[]>,
) => {
  const [hiveRequestHandler, evmRequestHandler] = await Promise.all([
    HiveRequestsHandler.getFromLocalStorage(),
    EvmRequestHandler.getFromLocalStorage(),
  ]);
  const removedCounts = await remove(hiveRequestHandler, evmRequestHandler);
  if (removedCounts.some((count) => count > 0)) {
    await syncSharedDialogWindow({ hiveRequestHandler, evmRequestHandler });
  }
};

const cleanupTab = async (tab: number) =>
  cleanup((hiveRequestHandler, evmRequestHandler) =>
    Promise.all([
      hiveRequestHandler.removeRequestsForTab(tab),
      evmRequestHandler.removeRequestsForTab(tab),
    ]),
  );

const cleanupNavigation = async (
  details: chrome.webNavigation.WebNavigationTransitionCallbackDetails,
) =>
  cleanup((hiveRequestHandler, evmRequestHandler) =>
    Promise.all([
      hiveRequestHandler.removeRequestsForNavigation(
        details.tabId,
        details.frameId,
        details.documentId,
      ),
      evmRequestHandler.removeRequestsForNavigation(
        details.tabId,
        details.frameId,
        details.documentId,
      ),
    ]),
  );

const register = () => {
  if (isRegistered) return;
  isRegistered = true;
  chrome.tabs.onRemoved.addListener((tab) => {
    void cleanupTab(tab);
  });
  chrome.webNavigation.onCommitted.addListener((details) => {
    void cleanupNavigation(details);
  });
};

export const PendingRequestLifecycle = { register };

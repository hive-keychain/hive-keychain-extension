const isExtensionPathEnding = (pathname: string, suffix: string): boolean => {
  return pathname.endsWith(suffix);
};

const isToolbarPopup = (pathname: string = window.location.pathname): boolean => {
  return isExtensionPathEnding(pathname, '/popup.html');
};

const isDetachedTab = (
  pathname: string = window.location.pathname,
): boolean => {
  return pathname.includes('detached_window.html');
};

const isSidePanelPage = (
  pathname: string = window.location.pathname,
): boolean => {
  return isExtensionPathEnding(pathname, '/sidepanel.html');
};

export const ExtensionSurfaceUtils = {
  isToolbarPopup,
  isDetachedTab,
  isSidePanelPage,
};

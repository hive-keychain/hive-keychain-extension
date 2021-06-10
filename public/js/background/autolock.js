const startAutolock = async (autoLock) => {
  //Receive autoLock from the popup (upon registration or unlocking)
  if (
      idleListenerReady === false
      && (autoLock && autoLock.type !== "default")
      && (autoLock.type === "locked"  || autoLock.type === "idle")
  ) {
    console.log('hive-keychain: setting up idle listener');
    chrome.idle.setDetectionInterval(parseInt(autoLock.mn) * 60);
    chrome.idle.onStateChanged.addListener(state => {
      switch(true) {
        case (autoLock.type === "locked" && state === "locked"):
          mk = null;
          console.log('hive-keychain: locking because computer locked');
          break;

        case (autoLock.type === "idle" && state !== "active"):
          mk = null;
          console.log('hive-keychain: locking because user idled or computer locked');
          break;

        default:
          // Nothing
          break;
      }
    });
    idleListenerReady = true;
  }
};
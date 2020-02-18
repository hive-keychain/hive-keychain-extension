const startAutolock = async autoLock => {
  //Receive autolock from the popup (upon registration or unlocking)
  autolock = autoLock;
  console.log(autolock);
  if (mk == null) return;
  if (!autolock || autolock.type == "default") return;
  if (autolock.type == "locked") {
    chrome.idle.setDetectionInterval(parseInt(autolock.mn) * 60);
    chrome.idle.onStateChanged.addListener(state => {
      console.log(state, autolock.type);
      if (state === "locked") {
        mk = null;
        console.log("lock");
      }
    });
  } else if (autolock.type == "idle") {
    restartIdleCounter();
  }
};
//Create Custom Idle Function
const restartIdleCounter = () => {
  console.log("idleCounter", new Date().toISOString());
  clearTimeout(timeoutIdle);
  timeoutIdle = setTimeout(() => {
    console.log("locked", new Date().toISOString());
    mk = null;
  }, autolock.mn * 60000);
};

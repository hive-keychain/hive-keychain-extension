// Communication with the background

// Send new autolock to background;
function setAutolock(autolock) {
    chrome.runtime.sendMessage({
        command: "sendAutolock",
        autolock: autolock
    });
}

// get MK from background
function getMK() {
    chrome.runtime.sendMessage({
        command: "getMk"
    });
}

// setRPC in the background
function setRPC(rpc) {
    chrome.runtime.sendMessage({
        command: "setRPC",
        rpc:rpc
    });
}

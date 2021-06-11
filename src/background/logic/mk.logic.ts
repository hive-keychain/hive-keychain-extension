import { BackgroundCommand } from "src/reference-data/background-message-key.enum"

const MkModule = {
    sendBackMk,
}

function sendBackMk(mk:string): void {
    chrome.runtime.sendMessage({
        command: BackgroundCommand.SEND_BACK_MK,
        value: mk
    })
}

export default MkModule;
import { BackgroundCommand } from "src/reference-data/background-message-key.enum";
import { BackgroundMessage } from "./background-message.interface";
import MkModule from "./logic/mk.logic";


const chromeMessageHandler = (backgroundMessage: BackgroundMessage, sender: any, sendResp: any) => {
    switch(backgroundMessage.command){
        case BackgroundCommand.GET_MK: 
        MkModule.sendBackMk()
        case BackgroundCommand.SAVE_MK: 
        MkModule.saveMk(backgroundMessage.value)
    }
}

chrome.runtime.onMessage.addListener(chromeMessageHandler);
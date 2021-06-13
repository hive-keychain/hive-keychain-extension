import { BackgroundCommand } from "src/reference-data/background-message-key.enum";
import { BackgroundMessage } from "./background-message.interface";
import MkModule from "./logic/mk.logic";

let mk: string = '';

const chromeMessageHandler = (backgroundMessage: BackgroundMessage, sender: any, sendResp: any) => {
    switch(backgroundMessage.command){
        case BackgroundCommand.GET_MK: 
            MkModule.sendBackMk(mk)
    }
}

chrome.runtime.onMessage.addListener(chromeMessageHandler);
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
};

let mk: string | null = null;

function getMk(): string | null {
  return mk;
}

function sendBackMk(): void {
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_MK,
    value: mk,
  });
}

function saveMk(newMk: string): void {
  mk = newMk;
}

export default MkModule;

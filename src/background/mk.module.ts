import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';

const MkModule = {
  sendBackMk,
  saveMk,
  getMk,
  resetMk,
};

let mk: string | null = process.env.DEV_MK || null;

function getMk(): string | null {
  return mk;
}

function sendBackMk(): void {
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SEND_BACK_MK,
    value: getMk(),
  });
}

function saveMk(newMk: string): void {
  mk = newMk;
}

function resetMk(): void {
  mk = '';
}

export default MkModule;

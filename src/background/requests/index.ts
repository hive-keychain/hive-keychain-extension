import { KeychainRequestWrapper } from 'src/interfaces/keychain.interface';

let tab = null;
let request = null;
let request_id = null;

const sendRequest = (
  sender: chrome.runtime.MessageSender,
  msg: KeychainRequestWrapper,
) => {
  tab = sender.tab!.id;
  console.log(msg);
  //   checkBeforeCreate(msg.request, tab, msg.domain);
  //   request = msg.request;
  request_id = msg.request_id;
};
const RequestsModule = {
  sendRequest,
};

export default RequestsModule;

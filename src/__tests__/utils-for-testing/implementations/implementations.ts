import { AutoLockType } from '@interfaces/autolock.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

const messagesJsonFile = require('public/_locales/en/messages.json');
const getValuefromLS = (...args: any[]) => {
  if (args[0] === LocalStorageKeyEnum.AUTOLOCK) {
    return {
      type: AutoLockType.DEFAULT,
      mn: 1,
    };
  } else if (args[0] === LocalStorageKeyEnum.SWITCH_RPC_AUTO) {
    return true;
  }
};

const i18nGetMessage = (message: string) => {
  if (messagesJsonFile[message]) {
    return messagesJsonFile[message].message;
  }
  return message + ' check as not found on jsonFile.';
};

const withOptions = (message: string, options?: string[]) => {
  if (options && options.length) {
    let str = message;
    for (const [key, value] of Object.entries(options)) {
      str = str.replace(`$${+key + 1}`, value);
    }
    return str;
  } else {
    return message;
  }
};

const i18nGetMessageCustom = (message: string, options?: string[]) => {
  if (messagesJsonFile[message]) {
    return withOptions(messagesJsonFile[message].message, options);
  }
  return message + ' check as not found on jsonFile.';
};

const mocksImplementation = {
  getValuefromLS,
  i18nGetMessage,
  i18nGetMessageCustom,
};

export default mocksImplementation;

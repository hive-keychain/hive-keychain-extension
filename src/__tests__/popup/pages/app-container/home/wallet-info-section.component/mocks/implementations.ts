const messagesJsonFile = require('public/_locales/en/messages.json');

const shortDelegationLabel = 'thor';

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
    if (message === 'popup_html_delegations') {
      return shortDelegationLabel;
    }
    return withOptions(messagesJsonFile[message].message, options);
  }
  return message + ' check as not found on jsonFile.';
};

const walletInfoImplementations = {
  i18nGetMessageCustom,
  shortDelegationLabel,
};

export default walletInfoImplementations;

const getMessage = async (name: string, options?: string[]) => {
  const lang = chrome.i18n.getUILanguage
    ? chrome.i18n.getUILanguage().split('-')[0]
    : 'en';
  let res;
  try {
    const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
    const file = await (await fetch(url)).json();
    res = withOptions(file[name].message, options);
  } catch (e) {
    const urlEn = chrome.runtime.getURL(`_locales/en/messages.json`);
    const file = await (await fetch(urlEn)).json();

    res = file[name]
      ? withOptions(file[name].message, options)
      : `[Missing ${name} locale]`;
  } finally {
    return res;
  }
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

export default getMessage;

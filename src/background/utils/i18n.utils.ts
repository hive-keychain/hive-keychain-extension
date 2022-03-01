const getMessage = async (name: string) => {
  const lang = chrome.i18n.getUILanguage().split('-')[0];
  let res;
  try {
    const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
    const file = await (await fetch(url)).json();
    res = file[name].message;
  } catch (e) {
    const urlEn = chrome.runtime.getURL(`_locales/en/messages.json`);
    const file = await (await fetch(urlEn)).json();

    res = file[name] ? file[name].message : `[Missing ${name} locale]`;
  } finally {
    //Logger.log('[i18n]', lang, name, res);
    return res;
  }
};

export default getMessage;

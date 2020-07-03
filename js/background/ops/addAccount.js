const addAccount = async data => {
  const { username, keys } = data;
  let savedKeys = {};
  let err = null;
  console.log(username, keys);
  const user = (await hive.api.getAccountsAsync([username]))[0];
  console.log(user);
  if (user) {
    const publicKeys = {
      posting: user.posting.key_auths.map(e => e[0]),
      active: user.active.key_auths.map(e => e[0]),
      memo: user.memo_key
    };
    console.log(publicKeys);
    for (const key of ["posting", "active", "memo"]) {
      const thisKey = keys[key];
      if (thisKey && hive.auth.isWif(thisKey)) {
        console.log(key + "iswif");
        const public = hive.auth.wifToPublic(thisKey);
        console.log(public);
        if (
          (key === "memo" && publicKeys[key] === public) ||
          (key !== "memo" && publicKeys[key].includes(public))
        ) {
          console.log("is realkey");
          savedKeys[key] = thisKey;
          savedKeys[`${key}Pubkey`] = public;
        }
      }
    }
    console.log("saved keys", savedKeys);
    if (Object.keys(savedKeys).length) {
      // addAccount
      const account = new Account({ name: username, keys: savedKeys });
      accountsList.add(account).save(mk);
    } else {
      // Error no corresponding keys
      err = chrome.i18n.getMessage("bgd_ops_add_account_error");
    }
  } else {
    // Error no such account
    err = chrome.i18n.getMessage("bgd_ops_add_account_error_invalid");
  }
  return createMessage(
    !!err,
    !err,
    data,
    err ? null : chrome.i18n.getMessage("bgd_ops_add_account", [username]),
    err
  );
};

const broadcastAddAccountAuthority = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.addAccountAuth(
      {
        signingKey: key,
        username: data.username,
        authorizedUsername: data.authorizedUsername,
        role: data.role.toLowerCase(),
        weight: parseInt(data.weight)
      },
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          chrome.i18n.getMessage("bgd_ops_add_auth", [
            data.role.toLowerCase(),
            data.authorizedUsername,
            data.username
          ]),
          err_message
        );
        resolve(message);
      }
    );
  });
};

const broadcastRemoveAccountAuthority = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.removeAccountAuth(
      {
        signingKey: key,
        username: data.username,
        authorizedUsername: data.authorizedUsername,
        role: data.role.toLowerCase()
      },
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          chrome.i18n.getMessage("bgd_ops_remove_auth", [
            data.role.toLowerCase(),
            data.authorizedUsername,
            data.username
          ]),
          err_message
        );
        resolve(message);
      }
    );
  });
};

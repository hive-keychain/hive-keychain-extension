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
        const message = createMessage(
          err,
          result,
          data,
          "The transaction has been broadcasted successfully.",
          "There was an error broadcasting this transaction, please try again."
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
        const message = createMessage(
          err,
          result,
          data,
          "The transaction has been broadcasted successfully.",
          "There was an error broadcasting this transaction, please try again."
        );
        resolve(message);
      }
    );
  });
};

const broadcastPost = data => {
  console.log("broadcastPost");
  console.log(data);
  return new Promise((resolve, reject) => {
    if (data.comment_options == "") {
      steem.broadcast.comment(
        key,
        data.parent_username,
        data.parent_perm,
        data.username,
        data.permlink,
        data.title,
        data.body,
        data.json_metadata,
        (err, result) => {
          console.log(result, err);
          const err_message = beautifyErrorMessage(err);
          const message = createMessage(
            err,
            result,
            data,
            chrome.i18n.getMessage("bgd_ops_post"),
            err_message
          );
          resolve(message);
        }
      );
    } else {
      const operations = [
        [
          "comment",
          {
            parent_author: data.parent_username,
            parent_permlink: data.parent_perm,
            author: data.username,
            permlink: data.permlink,
            title: data.title,
            body: data.body,
            json_metadata: data.json_metadata
          }
        ],
        ["comment_options", JSON.parse(data.comment_options)]
      ];
      steem.broadcast.send(
        {
          operations,
          extensions: []
        },
        {
          posting: key
        },
        (err, result) => {
          console.log(result, err);
          const err_message = beautifyErrorMessage(err);

          const message = createMessage(
            err,
            result,
            data,
            chrome.i18n.getMessage("bgd_ops_post"),
            err_message
          );
          resolve(message);
        }
      );
    }
  });
};

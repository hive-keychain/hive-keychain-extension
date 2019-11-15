async function performTransaction(data, tab, no_confirm) {
  try {
    if (data.rpc) rpc.setOptions(data.rpc, true);
    switch (data.type) {
      case "vote":
        steem.broadcast.vote(
          key,
          data.username,
          data.author,
          data.permlink,
          parseInt(data.weight),
          function(err, result) {
            const message = {
              command: "answerRequest",
              msg: {
                success: err == null,
                error: err,
                result: result,
                data: data,
                message:
                  err == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            console.log("messageVote", message, err, result);
            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );
        break;
      case "custom":
        steem.broadcast.customJson(
          key,
          data.method.toLowerCase() == "active" ? [data.username] : null,
          data.method.toLowerCase() == "posting" ? [data.username] : null,
          data.id,
          data.json,
          function(err, result) {
            console.log(err, result);
            const message = {
              command: "answerRequest",
              msg: {
                success: err == null,
                error: err,
                result: result,
                data: data,
                message:
                  err == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) {
                removeWindow(id_win);
              }
            } else chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );

        break;
      case "transfer":
        let ac = accounts.list.find(function(e) {
          return e.name == data.username;
        });
        let memo = data.memo || "";
        let key_transfer = ac.keys.active;
        if (data.memo && data.memo.length > 0 && data.memo[0] == "#") {
          try {
            const receiver = await steem.api.getAccountsAsync([data.to]);
            const memoReceiver = receiver["0"].memo_key;
            memo = window.encodeMemo(ac.keys.memo, memoReceiver, memo);
          } catch (e) {
            console.log(e);
          }
        }
        steem.broadcast.transfer(
          key_transfer,
          data.username,
          data.to,
          data.amount + " " + data.currency,
          memo,
          function(err, result) {
            const message = {
              command: "answerRequest",
              msg: {
                success: err == null,
                error: err,
                result: result,
                data: data,
                message:
                  err == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };

            chrome.tabs.sendMessage(tab, message);
            chrome.runtime.sendMessage(message);
            rpc.rollback();
            key = null;
            accounts = null;
          }
        );
        break;
      case "post":
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
            function(err, result) {
              const message = {
                command: "answerRequest",
                msg: {
                  success: err == null,
                  error: err,
                  result: result,
                  data: data,
                  message:
                    err == null
                      ? "The transaction has been broadcasted successfully."
                      : "There was an error broadcasting this transaction, please try again.",
                  request_id: request_id
                }
              };
              chrome.tabs.sendMessage(tab, message);
              if (no_confirm) {
                if (id_win != null) removeWindow(id_win);
              } else chrome.runtime.sendMessage(message);
              key = null;
              accounts = null;
              rpc.rollback();
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
            function(err, result) {
              const message = {
                command: "answerRequest",
                msg: {
                  success: err == null,
                  error: err,
                  result: result,
                  data: data,
                  message:
                    err == null
                      ? "The transaction has been broadcasted successfully."
                      : "There was an error broadcasting this transaction, please try again.",
                  request_id: request_id
                }
              };
              chrome.tabs.sendMessage(tab, message);
              if (no_confirm) {
                if (id_win != null) removeWindow(id_win);
              } else chrome.runtime.sendMessage(message);
              key = null;
              accounts = null;
              rpc.rollback();
            }
          );
        }
        break;
      case "addAccountAuthority":
        steem.broadcast.addAccountAuth(
          {
            signingKey: key,
            username: data.username,
            authorizedUsername: data.authorizedUsername,
            role: data.role.toLowerCase(),
            weight: parseInt(data.weight)
          },
          function(err, result) {
            console.log(err, result);
            const message = {
              command: "answerRequest",
              msg: {
                success: err == null,
                error: err,
                result: result,
                data: data,
                message:
                  err == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );
        break;
      case "removeAccountAuthority":
        steem.broadcast.removeAccountAuth(
          {
            signingKey: key,
            username: data.username,
            authorizedUsername: data.authorizedUsername,
            role: data.role.toLowerCase()
          },
          function(err, result) {
            console.log(err, result);
            const message = {
              command: "answerRequest",
              msg: {
                success: err == null,
                error: err,
                result: result,
                data: data,
                message:
                  err == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );
        break;
      case "createClaimedAccount":
        steem.broadcast
          .createClaimedAccountAsync(
            key,
            data.username,
            data.new_account,
            JSON.parse(data.owner),
            JSON.parse(data.active),
            JSON.parse(data.posting),
            data.memo,
            {},
            []
          )
          .then(function(result, err) {
            console.log(err, result);
            const message = {
              command: "answerRequest",
              msg: {
                success: err == null,
                error: err,
                result: result,
                data: data,
                message:
                  err == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          });
        break;
      case "broadcast":
        const operations = data.operations;
        const broadcastKeys = {};
        broadcastKeys[data.typeWif] = key;
        console.log(operations, broadcastKeys);
        steem.broadcast.send(
          {
            operations,
            extensions: []
          },
          broadcastKeys,
          function(err, result) {
            console.log(err, result);
            const message = {
              command: "answerRequest",
              msg: {
                success: err == null,
                error: err,
                result: result,
                data: data,
                message:
                  err == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );
        break;
      case "signedCall":
        window.signedCall(
          data.method,
          data.params,
          data.username,
          key,
          function(err, result) {
            console.log(err, result);
            const message = {
              command: "answerRequest",
              msg: {
                success: err == null,
                error: err,
                result: result,
                data: data,
                message:
                  err == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );
        break;
      case "delegation":
        steem.api.getDynamicGlobalPropertiesAsync().then(res => {
          let delegated_vest = null;
          if (data.unit == "SP") {
            const totalSteem = Number(
              res.total_vesting_fund_steem.split(" ")[0]
            );
            const totalVests = Number(res.total_vesting_shares.split(" ")[0]);
            delegated_vest =
              (parseFloat(data.amount) * totalVests) / totalSteem;
            delegated_vest = delegated_vest.toFixed(6);
            delegated_vest = delegated_vest.toString() + " VESTS";
          } else {
            delegated_vest = data.amount + " VESTS";
          }
          steem.broadcast.delegateVestingShares(
            key,
            data.username,
            data.delegatee,
            delegated_vest,
            function(error, result) {
              const message = {
                command: "answerRequest",
                msg: {
                  success: error == null,
                  error: error,
                  result: result,
                  data: data,
                  message:
                    error == null
                      ? "The transaction has been broadcasted successfully."
                      : "There was an error broadcasting this transaction, please try again.",
                  request_id: request_id
                }
              };
              chrome.tabs.sendMessage(tab, message);
              if (no_confirm) {
                if (id_win != null) removeWindow(id_win);
              } else chrome.runtime.sendMessage(message);
              key = null;
              accounts = null;
              rpc.rollback();
            }
          );
        });
        break;
      case "witnessVote":
        steem.broadcast.accountWitnessVote(
          key,
          data.username,
          data.witness,
          data.vote ? 1 : 0,
          function(error, result) {
            const message = {
              command: "answerRequest",
              msg: {
                success: error == null,
                error: error,
                result: result,
                data: data,
                message:
                  error == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );
        break;
      case "powerUp":
        steem.broadcast.transferToVesting(
          key,
          data.username,
          data.recipient,
          data.steem + " STEEM",
          function(error, result) {
            const message = {
              command: "answerRequest",
              msg: {
                success: error == null,
                error: error,
                result: result,
                data: data,
                message:
                  error == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );
        break;
      case "powerDown":
        steem.api.getDynamicGlobalPropertiesAsync().then(res => {
          let vestingShares = null;
          const totalSteem = Number(res.total_vesting_fund_steem.split(" ")[0]);
          const totalVests = Number(res.total_vesting_shares.split(" ")[0]);
          vestingShares =
            (parseFloat(data.steem_power) * totalVests) / totalSteem;
          vestingShares = vestingShares.toFixed(6);
          vestingShares = vestingShares.toString() + " VESTS";

          steem.broadcast.withdrawVesting(
            key,
            data.username,
            vestingShares,
            function(error, result) {
              const message = {
                command: "answerRequest",
                msg: {
                  success: error == null,
                  error: error,
                  result: result,
                  data: data,
                  message:
                    error == null
                      ? "The transaction has been broadcasted successfully."
                      : "There was an error broadcasting this transaction, please try again.",
                  request_id: request_id
                }
              };
              chrome.tabs.sendMessage(tab, message);
              chrome.runtime.sendMessage(message);
              key = null;
              accounts = null;
              rpc.rollback();
            }
          );
        });
        break;
      case "sendToken":
        const id = config.mainNet;
        const json = {
          contractName: "tokens",
          contractAction: "transfer",
          contractPayload: {
            symbol: data.currency,
            to: data.to,
            quantity: data.amount,
            memo: data.memo
          }
        };
        steem.broadcast.customJson(
          key,
          [data.username],
          null,
          id,
          JSON.stringify(json),
          function(error, result) {
            console.log(error, result);
            const message = {
              command: "answerRequest",
              msg: {
                success: error == null,
                error: error,
                result: result,
                data: data,
                message:
                  error == null
                    ? "The transaction has been broadcasted successfully."
                    : "There was an error broadcasting this transaction, please try again.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          }
        );
        break;
      case "createProposal":
        let keys = {};
        keys[data.typeWif] = key;
        createProposal(
          keys,
          data.username,
          data.receiver,
          data.start,
          data.end,
          data.daily_pay,
          data.subject,
          data.permlink,
          data.extensions
        )
          .then(result => {
            let message = {
              command: "answerRequest",
              msg: {
                success: true,
                error: null,
                result: result,
                data: data,
                message: "Proposal created succesfully",
                request_id: request_id
              }
            };

            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else {
              chrome.runtime.sendMessage(message);
            }
            key = null;
            accounts = null;
            rpc.rollback();
          })
          .catch(err => {
            console.log(err);
            let message = {
              command: "answerRequest",
              msg: {
                success: false,
                error: "create_proposal_error",
                result: null,
                data: data,
                message: "Could not create proposal.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          });
        break;
      case "updateProposalVote":
        let voteKeys = {};
        voteKeys[data.typeWif] = key;
        voteForProposal(
          voteKeys,
          data.username,
          data.proposal_ids,
          data.approve,
          data.extensions
        )
          .then(result => {
            let message = {
              command: "answerRequest",
              msg: {
                success: true,
                error: null,
                result: result,
                data: data,
                message: "Proposal voted succesfully",
                request_id: request_id
              }
            };

            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else {
              chrome.runtime.sendMessage(message);
            }
            key = null;
            accounts = null;
            rpc.rollback();
          })
          .catch(err => {
            console.log(err);
            let message = {
              command: "answerRequest",
              msg: {
                success: false,
                error: "vote_proposal_error",
                result: null,
                data: data,
                message: "Could not vote for proposal.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          });
        break;
      case "removeProposal":
        let removeProposalKeys = {};
        removeProposalKeys[data.typeWif] = key;
        removeProposal(
          removeProposalKeys,
          data.username,
          data.proposal_ids,
          data.extensions
        )
          .then(result => {
            let message = {
              command: "answerRequest",
              msg: {
                success: true,
                error: null,
                result: result,
                data: data,
                message: "Proposal removed succesfully",
                request_id: request_id
              }
            };

            chrome.tabs.sendMessage(tab, message);
            if (no_confirm) {
              if (id_win != null) removeWindow(id_win);
            } else {
              chrome.runtime.sendMessage(message);
            }
            key = null;
            accounts = null;
            rpc.rollback();
          })
          .catch(err => {
            console.log(err);
            let message = {
              command: "answerRequest",
              msg: {
                success: false,
                error: "remove_proposal_error",
                result: null,
                data: data,
                message: "Could not remove the proposal.",
                request_id: request_id
              }
            };
            chrome.tabs.sendMessage(tab, message);
            chrome.runtime.sendMessage(message);
            key = null;
            accounts = null;
            rpc.rollback();
          });
        break;
      case "decode":
        try {
          let decoded = window.decodeMemo(key, data.message);

          let message = {
            command: "answerRequest",
            msg: {
              success: true,
              error: null,
              result: decoded,
              data: data,
              message: "Memo decoded succesfully",
              request_id: request_id
            }
          };

          chrome.tabs.sendMessage(tab, message);
          if (no_confirm) {
            if (id_win != null) removeWindow(id_win);
          } else {
            chrome.runtime.sendMessage(message);
          }
          key = null;
          accounts = null;
        } catch (err) {
          console.log(err);
          let message = {
            command: "answerRequest",
            msg: {
              success: false,
              error: "decode_error",
              result: null,
              data: data,
              message: "Could not verify key.",
              request_id: request_id
            }
          };
          chrome.tabs.sendMessage(tab, message);
          chrome.runtime.sendMessage(message);
          key = null;
          accounts = null;
          rpc.rollback();
        }
        break;
      case "signBuffer":
        try {
          let signed = window.signBuffer(data.message, key);

          let message = {
            command: "answerRequest",
            msg: {
              success: true,
              error: null,
              result: signed,
              data: data,
              message: "Message signed succesfully",
              request_id: request_id
            }
          };
          chrome.tabs.sendMessage(tab, message);
          if (no_confirm) {
            if (id_win != null) removeWindow(id_win);
          } else chrome.runtime.sendMessage(message);
          key = null;
          accounts = null;
          rpc.rollback();
        } catch (err) {
          console.log(err);
          let message = {
            command: "answerRequest",
            msg: {
              success: false,
              error: "sign_error",
              result: null,
              data: data,
              message: "Could not sign.",
              request_id: request_id
            }
          };
          chrome.tabs.sendMessage(tab, message);
          if (no_confirm) {
            if (id_win != null) removeWindow(id_win);
          } else chrome.runtime.sendMessage(message);
          key = null;
          accounts = null;
          rpc.rollback();
        }
        break;
    }
  } catch (e) {
    console.log("error", e);
    rpc.rollback();
    sendErrors(
      tab,
      "transaction_error",
      "An unknown error has occurred.",
      "An unknown error has occurred.",
      data
    );
  }
}

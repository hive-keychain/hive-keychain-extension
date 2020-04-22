const checkBeforeCreate = (request, tab, domain) => {
  if (mk == null) {
    // if locked
    const callback = () => {
      chrome.runtime.sendMessage({
        command: "sendDialogError",
        msg: {
          success: false,
          error: "locked",
          result: null,
          data: request,
          message: chrome.i18n.getMessage("bgd_auth_locked"),
          display_msg: chrome.i18n.getMessage("bgd_auth_locked_desc")
        },
        tab: tab,
        domain: domain
      });
    };
    createPopup(callback);
  } else {
    // if not locked
    chrome.storage.local.get(
      ["accounts", "no_confirm", "current_rpc"],
      function(items) {
        const {memo, username, type, enforce} = request;
        // Check user
        if (!items.accounts) {
          createPopup(() => {
            sendErrors(
              tab,
              "no_wallet",
              chrome.i18n.getMessage("bgd_init_no_wallet"),
              "",
              request
            );
          });
        } else {
          // Check that user and wanted keys are in the wallet
          accountsList.init(decryptToJson(items.accounts, mk));
          let account = null;
          if (type === "transfer") {
            let tr_accounts = accountsList
              .getList()
              .filter(e => e.hasKey("active"))
              .map(e => e.getName());

            const encode = memo && memo.length > 0 && memo[0] == "#";
            const enforced = enforce || encode;
            if (encode) account = accountsList.get(username);
            // If a username is specified, check that its active key has been added to the wallet
            if (
              enforced &&
              username &&
              !accountsList.get(username).hasKey("active")
            ) {
              createPopup(() => {
                sendErrors(
                  tab,
                  "user_cancel",
                  chrome.i18n.getMessage("bgd_auth_canceled"),
                  chrome.i18n.getMessage("bgd_auth_transfer_no_active", [
                    username
                  ]),
                  request
                );
              });
            } else if (encode && !account.hasKey("memo")) {
              createPopup(() => {
                sendErrors(
                  tab,
                  "user_cancel",
                  chrome.i18n.getMessage("bgd_auth_canceled"),
                  chrome.i18n.getMessage("bgd_auth_transfer_no_memo", [
                    username
                  ]),
                  request
                );
              });
            } else if (tr_accounts.length == 0) {
              createPopup(() => {
                sendErrors(
                  tab,
                  "user_cancel",
                  chrome.i18n.getMessage("bgd_auth_canceled"),
                  chrome.i18n.getMessage("bgd_auth_transfer_no_active", [
                    username
                  ]),
                  request
                );
              });
            } else {
              const callback = () => {
                chrome.runtime.sendMessage({
                  command: "sendDialogConfirm",
                  data: request,
                  domain,
                  accounts: tr_accounts,
                  tab,
                  testnet: items.current_rpc === "TESTNET"
                });
              };
              createPopup(callback);
            }
            // if transfer
          } else if (
            ["delegation", "witnessVote", "proxy"].includes(type) &&
            !username
          ) {
            // if no username specified for witness vote or delegation
            const tr_accounts = accountsList
              .getList()
              .filter(e => e.hasKey("active"))
              .map(e => e.getName());
            if (tr_accounts.length == 0) {
              createPopup(() => {
                sendErrors(
                  tab,
                  "user_cancel",
                  chrome.i18n.getMessage("bgd_auth_canceled"),
                  chrome.i18n.getMessage("bgd_auth_no_active"),
                  request
                );
              });
            } else {
              const callback = () => {
                chrome.runtime.sendMessage({
                  command: "sendDialogConfirm",
                  data: request,
                  domain,
                  accounts: tr_accounts,
                  tab,
                  testnet: items.current_rpc === "TESTNET"
                });
              };
              createPopup(callback);
            }
          } else {
            // if not a transfer nor witness/delegation with dropdown
            if (!accountsList.get(username)) {
              const callback = () => {
                sendErrors(
                  tab,
                  "user_cancel",
                  chrome.i18n.getMessage("bgd_auth_canceled"),
                  chrome.i18n.getMessage("bgd_auth_no_account", [username]),
                  request
                );
              };
              createPopup(callback);
            } else {
              account = accountsList.get(username);
              let typeWif = getRequiredWifType(request);
              let req = request;
              req.key = typeWif;

              if (req.type == "custom") req.method = typeWif;

              if (req.type == "broadcast") {
                req.typeWif = typeWif;
              }

              if (!account.hasKey(typeWif)) {
                createPopup(() => {
                  sendErrors(
                    tab,
                    "user_cancel",
                    chrome.i18n.getMessage("bgd_auth_canceled"),
                    chrome.i18n.getMessage("bgd_auth_no_key", [
                      username,
                      typeWif
                    ]),
                    request
                  );
                });
              } else {
                public = account.getKey(`${typeWif}Pubkey`);
                key = account.getKey(typeWif);
                if (
                  !hasNoConfirm(
                    items.no_confirm,
                    req,
                    domain,
                    items.current_rpc
                  )
                ) {
                  const callback = () => {
                    chrome.runtime.sendMessage({
                      command: "sendDialogConfirm",
                      data: req,
                      domain,
                      tab,
                      testnet: items.current_rpc === "TESTNET"
                    });
                  };
                  createPopup(callback);
                  // Send the request to confirmation window
                } else {
                  chrome.runtime.sendMessage({
                    command: "broadcastingNoConfirm"
                  });
                  performTransaction(req, tab, true);
                }
              }
            }
          }
        }
      }
    );
  }
};

const hasNoConfirm = (arr, data, domain, current_rpc) => {
  try {
    if (
      data.method == "active" ||
      arr == undefined ||
      current_rpc === "TESTNET" ||
      domain === "steemit.com"
    ) {
      return false;
    } else return JSON.parse(arr)[data.username][domain][data.type] == true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

// Get the key needed for each type of transaction
const getRequiredWifType = request => {
  switch (request.type) {
    case "decode":
    case "signBuffer":
      return request.method.toLowerCase();
      break;
    case "post":
    case "vote":
      return "posting";
      break;
    case "custom":
      return request.method == null || request.method == undefined
        ? "posting"
        : request.method.toLowerCase();
      break;
    case "addAccountAuthority":
    case "removeAccountAuthority":
    case "removeKeyAuthority":
    case "addKeyAuthority":
    case "broadcast":
      return request.method.toLowerCase();
    case "signedCall":
      return request.typeWif.toLowerCase();
    case "transfer":
      return "active";
      break;
    case "sendToken":
      return "active";
      break;
    case "delegation":
      return "active";
      break;
    case "witnessVote":
      return "active";
      break;
    case "proxy":
      return "active";
      break;
    case "powerUp":
      return "active";
      break;
    case "powerDown":
      return "active";
      break;
    case "createClaimedAccount":
      return "active";
      break;
    case "createProposal":
      return "active";
      break;
    case "removeProposal":
      return "active";
      break;
    case "updateProposalVote":
      return "active";
      break;
  }
};

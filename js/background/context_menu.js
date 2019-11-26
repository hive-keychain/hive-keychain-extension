const contextMenus = {
  menuActions: {
    contexts: {
      link: {
        transferToUser: {
          description: "Transfer STEEM/SBD to this user",
          action: "transferToUser"
        },
        memoMessageUser: {
          description: "Send a MEMO message to this user",
          action: "memoMessageUser"
        },
        tipUser: {
          description: "Tip this user",
          action: "tipUser"
        }
      },
      page: {
        transferToUser: {
          description: "Transfer STEEM/SBD to this author",
          action: "transferToUser"
        },
        memoMessageUser: {
          description: "Send a MEMO message to this author",
          action: "memoMessageUser"
        },
        tipUser: {
          description: "Tip this author",
          action: "tipUser"
        }
      }
    },

    actions: {
      transferToUser: function(url) {
        const user = url
          .split("@")
          .pop()
          .split("/")[0];
        createPopup(null, `html/popup.html?page=send_div&to=${user}&noback=1`);
      },
      memoMessageUser: function(url) {
        const user = url
          .split("@")
          .pop()
          .split("/")[0];
        createPopup(null, `html/popup.html?page=send_div&to=${user}&amount=0.001&noback=1`);
      },
      tipUser: function(url) {
        const user = url
          .split("@")
          .pop()
          .split("/")[0];
        createPopup(
          null,
          // @TODO make a settings UI for customizing default MEMO message and tipping amount
          `html/popup.html?page=send_div&to=${user}&amount=1&memo=I+appreciate+your+work+and+this+is+a+little+symbolic+tip+to+show+support.&noback=1`
        );
      },
    }
  },

  init: function() {
    console.log("initializing context menu");
    const contexts = ["link", "page"];

    for (let i = 0; i < contexts.length; i++) {
      const context = contexts[i];

      for (let menuActionName in contextMenus.menuActions.contexts[context]) {
        if (contextMenus.menuActions.contexts[context].hasOwnProperty(menuActionName)) {
          const menuAction = contextMenus.menuActions.contexts[context][menuActionName];
          const title = menuAction.description;

          if (context === 'link') {
            contextMenus.menuActions.contexts[context][menuActionName]
              .menuItemId = chrome.contextMenus.create({
              title: title,
              contexts: [context],
              onclick: contextMenus.genericOnClick,
              targetUrlPatterns: ["https://*/@*"], // @TODO make a better filter, maybe with a whitelist of known dApps
            });
          } else if (context === 'page') {
            contextMenus.menuActions.contexts[context][menuActionName]
              .menuItemId = chrome.contextMenus.create({
              title: title,
              contexts: [context],
              onclick: contextMenus.genericOnClick,
              documentUrlPatterns: ["https://*/@*", "https://*/*/@*"], // @TODO make a better filter, maybe with a whitelist of known dApps
            });
          }
        }
      }
    }
  },

  genericOnClick: function(info, tab) {
    for (let context in contextMenus.menuActions.contexts) {
      if (contextMenus.menuActions.contexts.hasOwnProperty(context)) {
        for (let menuName in contextMenus.menuActions.contexts[context]) {
          if (
            contextMenus.menuActions.contexts[context].hasOwnProperty(menuName)
          ) {
            const menuAction =
              contextMenus.menuActions.contexts[context][menuName];
            if (menuAction.menuItemId === info.menuItemId) {
              const url = info[context + "Url"];
              contextMenus.menuActions.actions[menuAction.action](
                url,
                menuAction
              );
            }
          }
        }
      }
    }
  }
};
contextMenus.init();

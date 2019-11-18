const contextMenus = {
  menuActions: {
    contexts: {
      link: {
        transferToUser: {
          description: "Transfer STEEM/SBD to user",
          action: "transferToUser"
        }
      }
    },

    actions: {
      transferToUser: function(url, menuAction) {
        const user = url
          .split("@")
          .pop()
          .split("/")[0];
        createPopup(null, `html/popup.html?page=send_div&to=${user}&noback=1`);
      }
    }
  },

  init: function() {
    console.log("intiializing context menu");
    // Create one test item for each context type.
    const contexts = ["link"];

    for (let i = 0; i < contexts.length; i++) {
      const context = contexts[i];

      for (let menuActionName in contextMenus.menuActions.contexts[context]) {
        if (
          contextMenus.menuActions.contexts[context].hasOwnProperty(
            menuActionName
          )
        ) {
          const menuAction =
            contextMenus.menuActions.contexts[context][menuActionName];

          const title = menuAction.description;
          contextMenus.menuActions.contexts[context][
            menuActionName
          ].menuItemId = chrome.contextMenus.create({
            title: title,
            contexts: [context],
            onclick: contextMenus.genericOnClick,
            targetUrlPatterns: ["https://*/@*"]
          });
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

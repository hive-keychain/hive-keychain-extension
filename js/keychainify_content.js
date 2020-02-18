let contentScript = {
  init: function() {
    contentScript.process.checkAnchors();
  },

  /**
   * This contains the logic for actually processing the content on the page
   */
  process: {
    initialized: false,
    observer: null,
    observerConfig: {
      attributes: false,
      childList: true,
      subtree: true,
      characterData: false
    },
    observerTimer: null,

    /**
     * Initializing the MutationObserver to support pages with lazy-loading.
     * Dynamically reacts to page change instead of regular polling.
     */
    initObserver: function() {
      let body = document.body;

      // Using a MutationObserver to wait for a DOM change
      // This is to scan dynamically loaded content (lazyload of comments for example)
      contentScript.process.observer = new MutationObserver(
        (function(process) {
          return function(mutations) {
            mutations.forEach(function(mutation) {
              // Preventing multipl calls to checkAnchors()
              if (process.observerTimer) {
                window.clearTimeout(process.observerTimer);
              }

              // Lets wait for a DOM change
              process.observerTimer = window.setTimeout(function() {
                process.checkAnchors();
              }, 500);
            });
          };
        })(contentScript.process)
      );

      // Waiting for the DOM to be modified (lazy loading)
      contentScript.process.observer.observe(
        body,
        contentScript.process.observerConfig
      );
    },

    /**
     * Verify all anchors to find scammy links
     */
    checkAnchors: function() {
      let anchors = document.querySelectorAll(
        "a[href]:not(.steem-keychain-checked)"
      );

      for (let i = 0; i < anchors.length; i++) {
        let anchor = anchors[i];

        if (
          anchor.href &&
          !anchor.classList.contains("steem-keychain-checked") && // That was not checked before
          keychainify.isUrlSupported(anchor.href)
        ) {
          anchor.addEventListener("click", async function(e) {
            e.preventDefault();

            if (await keychainify.isKeychainifyEnabled()) {
              keychainify.keychainifyUrl(this.href);
            } else {
              window.location.href = this.href;
            }
          });
        }

        anchor.classList.add("steem-keychain-checked");
      }
    },

    /**
     * Initialize the scanning process
     */
    init: function() {
      contentScript.process.initObserver();
      contentScript.process.checkAnchors();
    }
  }
};

contentScript.init();

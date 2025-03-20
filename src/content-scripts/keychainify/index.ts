/* istanbul ignore file */
import keychainify from './keychainify';

type Props = { process: Process; init: () => void };

type Process = {
  init: () => void;
  initialized: boolean;
  observer: MutationObserver | null;
  observerConfig: {
    attributes: boolean;
    childList: boolean;
    subtree: boolean;
    characterData: boolean;
  };
  observerTimer?: number;
  initObserver: () => void;
  checkAnchors: (isKeychainifyEnabled: boolean) => void;
};

let contentScript: Props = {
  init: function () {
    contentScript.process.init();
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
      characterData: false,
    },
    observerTimer: undefined,

    /**
     * Initializing the MutationObserver to support pages with lazy-loading.
     * Dynamically reacts to page change instead of regular polling.
     */
    initObserver: function () {
      let body = document.body;

      keychainify.isKeychainifyEnabled().then((isKeychainifyEnabled) => {
        // Using a MutationObserver to wait for a DOM change
        // This is to scan dynamically loaded content (lazyload of comments for example)
        contentScript.process.observer = new MutationObserver(
          (function (process) {
            return function (mutations: MutationRecord[]) {
              mutations.forEach(function () {
                // Preventing multiple calls to checkAnchors()
                if (process.observerTimer) {
                  window.clearTimeout(process.observerTimer);
                }
                // Lets wait for a DOM change
                process.observerTimer = window.setTimeout(function () {
                  process.checkAnchors(isKeychainifyEnabled);
                }, 500);
              });
            };
          })(contentScript.process),
        );

        // Waiting for the DOM to be modified (lazy loading)
        contentScript.process.observer.observe(
          body,
          contentScript.process.observerConfig,
        );
      });
    },

    /**
     * Verify all anchors to find HiveSigner links
     */
    checkAnchors: async function (isKeychainifyEnabled: boolean) {
      let anchors: NodeListOf<HTMLAnchorElement> = document.querySelectorAll(
        'a[href]:not(.keychainify-checked)',
      );

      for (let i = 0; i < anchors.length; i++) {
        let anchor = anchors[i];
        if (
          anchor.href &&
          !anchor.classList.contains('keychainify-checked') // That was not checked before
        ) {
          /**
           * When keychainify is enabled, both hivesigner and hive-uri will be supported. Otherwise only hive-uri.
           */
          const isSupportedUrl = isKeychainifyEnabled
            ? keychainify.isSupportedHiveSignerUrl(anchor.href) ||
              keychainify.isSupportedHiveUri(anchor.href)
            : keychainify.isSupportedHiveUri(anchor.href);
          /**
           * Attach click event listener when url is supported
           */
          if (isSupportedUrl) {
            anchor.addEventListener('click', async function (e) {
              e.preventDefault();
              e.stopPropagation();
              keychainify.keychainifyUrl(this.href);
              return false;
            });
          }
        }

        anchor.classList.add('keychainify-checked');
      }
    },

    /**
     * Initialize the scanning process
     */
    init: function () {
      contentScript.process.initObserver();
      contentScript.process.checkAnchors(false); // by default, all hive-uri will be checked
    },
  },
};

contentScript.init();

# LavaMoat smoke test

Run this before switching `build:beta` to `build:beta:lavamoat`. Leave the default Chromium, Firefox, and beta scripts unprotected until both sections below pass.

## Chromium beta

```sh
npm run build:beta:lavamoat
```

Load `dist-beta` as an unpacked extension.

- The popup opens and the service worker starts.
- Stop the service worker from the extensions page. The next Hive or EVM request starts it again and the request completes.
- A Hive dApp request reaches the dialog and the signature returns to the page. The injected `hive_keychain.js` still runs in the page.
- An EIP-1193 request reaches the dialog and the response returns.
- The MAIN-world provider appears, `eip6963:requestProvider` is answered, and the page's own JavaScript still runs.
- Preferred and yielding registration select the matching bundle, including when MetaMask or Rabby is already installed.
- A page event reaches the isolated content script and the protected background answers.
- Popup and service-worker DevTools show `Logger` output, and a thrown error still has a stack. If the safe console wrapper hides either, set `consoleTaming` to `'unsafe'` in `webpack/lavamoat/index.js` and record why.

## Firefox

Firefox has no separate beta package. Use the protected Firefox build:

```sh
npm run build:firefox:lavamoat
```

Load `dist-prod-firefox` as a temporary add-on. Firefox runs a background script, so there is no service worker to restart. Reload the temporary add-on, then repeat the request.

- The popup opens and the background script starts.
- After reloading the add-on, the next Hive or EVM request still completes.
- Repeat the Hive signing, EIP-1193, MAIN-world provider, EIP-6963, preferred and yielding registration, content-script, and DevTools checks from the Chromium section.
- Legacy provider registration still reaches `chrome.scripting`. Add a `browser` policy override only if registration fails without it.

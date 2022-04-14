![](http://u.cubeupload.com/arcange/yOdI5g.png)

Putting private keys directly into websites is not safe or secure, even ones run by reputable community members. Yet this is currently how nearly every Hive-based site or service currently works. On top of that, most Hive users likely use their master password which is even worse.

The Vessel desktop wallet software is a secure alternative, but it is too difficult to use for the majority of Hive users and does not easily interact with websites - which is Hive's primary use case.

On Ethereum, you never have to enter your private key into a website to use a dApp. You can just use a browser extension like Metamask, which dApp websites can interface with to securely store your keys and broadcast transactions to the blockchain.

Hive Keychain aims to bring the security and ease-of-use of Metamask to the Hive blockchain platform.

### Installation

You can download and install the latest published version of the extension for the following browsers:

- Google Chrome (or Opera/Brave): [on Chrome Store](https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep)
  - Export your keys from Steem keychain (in settings)
  - Download this repository as zip
  - Unzip the downloaded folder
  - Right click on any existing extension > Manage my extensions.
  - Activate developer mode.
  - Click "Load Unpacked" and select the unzipped folder.
  - Import your keys (use the same master password)
- Firefox: [on Firefox Addon Store](https://addons.mozilla.org/en-GB/firefox/addon/hive-keychain/)

### Features

The Hive Keychain extension includes the following features:

- Store an unlimited number of Hive account keys, encrypted with AES
- View balances, transaction history, voting power, and resource credits
- Send HIVE and HBD transfers, manage witness votes, and update HP delegation right from the extension
- Manage your Hive Engine tokens
- Power up or down
- Securely interact with Hive-based websites that have integrated with Hive Keychain
- Manage transaction confirmation preferences by account and by website
- Locks automatically on browser shutdown or manually using the lock button

### Website Integration

Websites can currently request the Hive Keychain extension to perform the following functions / broadcast operations:

- Send a handshake to make sure the extension is installed
- Decrypt a message encrypted by a Hive account private key (commonly used for "logging in")
- Post a comment (top level or reply)
- Broadcast a vote
- Broadcast a custom JSON operation
- Send a transfer
- Send Hive Engine tokens
- Send Delegations
- Power up/down
- Vote for witnesses
- Create/Remove/Vote for proposals
- Create claimed accounts
- Sign Tx

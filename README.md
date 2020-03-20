![](https://i.imgur.com/4rPWDFs.png)
---
Putting private keys directly into websites is not safe or secure. Even ones run by SteemIt, Inc. Yet this is currently how nearly every Steem-based site or service currently works. On top of that, most Steem users likely use their master password which is even worse

The Vessel desktop wallet software is a secure alternative, but it is too difficult to use for the majority of Steem users and does not easily interact with websites - which is Steem's primary use case.

On Ethereum, you never have to enter your private key into a website to use a dApp, you can just use a browser extension like Metamask, which dApp websites can interface with to securely store your keys and broadcast transactions to the blockchain.

Steem Keychain aims to bring the security and ease-of-use of Metamask to the Steem blockchain platform.

## Installation
You can download and install the latest published version of the extension for the following browsers:

- Google Chrome (or Brave): [https://chrome.google.com/webstore/detail/steem-keychain/lkcjlnjfpbikmcmbachjpdbijejflpcm](https://chrome.google.com/webstore/detail/steem-keychain/lkcjlnjfpbikmcmbachjpdbijejflpcm)
- Firefox: [https://addons.mozilla.org/en-US/firefox/addon/steem-keychain/](https://addons.mozilla.org/en-US/firefox/addon/steem-keychain/)

## Features
The Steem Keychain extension includes the following features:
- Store an unlimited number of Steem account keys, encrypted with AES
- View balances, transaction history, voting power, and resource credits
- Send STEEM and SBD transfers, manage witness votes, and update SP delegation right from the extension
- Securely interact with Steem-based websites that have integrated with Steem Keychain
- Manage transaction confirmation preferences by account and by website
- Locks automatically on browser shutdown or manually using the lock button

## Website Integration
Websites can currently request the Steem Keychain extension to perform the following functions / broadcast operations:
- Send a handshake to make sure the extension is installed
- Decrypt a message encrypted by a Steem account private key (commonly used for "logging in")
- Post a comment (top level or reply)
- Broadcast a vote
- Broadcast a custom JSON operation
- Send a transfer
- Send Steem Engine tokens
- Send Delegations
- Power up/down
- Vote for witnesses

## Example

An example of a web page that interacts with the extension is included in the "example" folder in the repo. You can test it by running a local HTTP server and going to http://localhost:1337/main.html in your browser.

`cd example`
`python -m http.server 1337 //or any other method to run a static server`

NOTE: On localhost, it will only run on port 1337.

## API Documentation

The Steem Keychain extension will inject a "hive_keychain" JavaScript into all web pages opened in the browser while the extension is running. You can therefore check if the current user has the extension installed using the following code:

```
if(window.hive_keychain) {
    // Steem Keychain extension installed...
} else {
    // Steem Keychain extension not installed...
}
```

### Handshake

Additionally, you can request a "handshake" from the extension to further ensure it's installed and that your page is able to connect to it:

```
hive_keychain.requestHandshake(function() {
    console.log('Handshake received!');
});
```

### Transfer

Sites can request that the extension sign and broadcast a transfer operation for STEEM or SBD. Note that a confirmation will always be shown to the user for transfer operations and they cannot be disabled.

```
hive_keychain.requestTransfer(account_name, to_account, amount, memo, currency, function(response) {
	console.log(response);
},enforce);
```
where `memo` will be encrypted using Memo key if it is starting by `#`, and `enforce` doesn't allow the user to chose which account will make the transfer but rather enforce `account_name`.

### Decode Memo / Verify Key

Sites can request that the extension decode a memo encrypted by the Memo, Posting, or Active key for a particular Steem account. This is messaged to the user as "Verify Key" since it is typically used to verify that they have access to the private key for an account in order to "log them in".

```
hive_keychain.requestVerifyKey(account_name, encrypted_message, key_type, function(response) {
    console.log(response);
});
```

The values for "key_type" can be: "Memo", "Posting", or "Active".

### Comment Operation

Sites can request that the extension sign and broadcast a "comment" operation (which can be a top-level post or a reply).

```
hive_keychain.requestPost(account_name, title, body, parent_permlink, parent_author, json_metadata, permlink, function(response) {
	console.log(response);
});
```

### Vote

Sites can request that the extension sign and broadcast a "vote" operation:

```
hive_keychain.requestVote(account_name, permlink, author, weight, function(response) {
	console.log(response);
});
```

### Custom JSON

Sites can request that the extension sign and broadcast a "custom_json" operation using either the posting or active key for the account:

```
hive_keychain.requestCustomJson(account_name, custom_json_id, key_type, json, display_name, function(response) {
	console.log(response);
});
```

Where "key_type" can be "Posting" or "Active" and "display_name" is a user-friendly name of the operation to be shown to the user so they know what operation is being broadcast (ex. "Steem Monsters Card Transfer").

### Sign

Sites can request that the extension sign messages:

```
hive_keychain.requestSignBuffer(account_name, message, key_type, function(response) {
        console.log(response);
});
```

Where "message" is any string and "key_type" can be "Posting" or "Active". This is equivalent to

```Signature.signBufferSha256(hash.sha256(message), wif).toHex();```

You can also pass in a JSON-stringified Node.js Buffer object. For example, if `buffer` is a Node.js Buffer
to be signed, you can pass `JSON.stringify(buffer)` as `message`, then this method becomes equivalent to

```Signature.signBufferSha256(hash.sha256(buffer), wif).toHex();```

### Add Account Authority

Sites can request that the extension add account authority for a given role:

```
hive_keychain.requestAddAccountAuthority(account_name, authorized_account_name, role, weight, function(response) {
        console.log(response);
});
```

where "role" can be "Posting" or "Active".

### Remove Account Authority

Sites can request that the extension remove account authority for a given role:

```
hive_keychain.requestRemoveAccountAuthority(account_name, authorized_account_name, role, function(response) {
        console.log(response);
});
```

where "role" can be "Posting" or "Active".

### Broadcast

Sites can request that the extension sign and broadcast general operations allowed by the `steem-js` library:

```
hive_keychain.requestBroadcast(account_name, operations, key_type, function(response) {
        console.log(response);
});
```

Where "operations" is the list of operations and "key_type" can be "Posting" or "Active". This is
roughly equivalent to

```
broadcast.send({ extensions: [], operations }, keys, errorCallback);
```

### Signed Call

Sites can request that per sign RPCs using steem authorities as specified in https://github.com/steemit/rpc-auth
and implemented in the `steem-js` library method signedCall:

```
hive_keychain.requestSignedCall(account_name, method, params, key_type, function(response) {
        console.log(response);
});
```

Where "method" is the method name, e.g. `conveyor.get_feature_flags`, "params" are the method parameters,
and "key_type" can be "Posting" or "Active".

### Send Tokens

Sites can request that Keychain broadcasts a JSON with active authority to transfer tokens to another user.
This works with tokens generated using [Steem Engine](https://steem-engine.com).

```
hive_keychain.requestSendToken(username, to,amount,memo, token, function(response) {
    console.log(response);
});
```

where `token` is the symbol of the said token.

### Delegate

Sites can request a delegation via Keychain, using the active authority :

```
hive_keychain.requestDelegation(username, delegatee, amount, unit, function(response) {
    console.log(response);
});
```

where `unit` can be either `VESTS` or `SP`. `amount` needs 6 decimals if the unit is `VESTS`, 3 if it is `SP`.

### Vote for a Witness

Sites can request that the user votes for a particular witness :

```
hive_keychain.requestWitnessVote(username, witness,vote, function(response) {
    console.log(response);
});
```

Where `vote` is a boolean, set to `true` for voting a witness, `false` for unvoting.

### Power Up

Sites can request a Power Up:

```
hive_keychain.requestPowerUp(username, to, amount, function(response) {
    console.log(response);
});
```

Where `to` is the recipient of the power up, and `amount` is expressed in STEEM (with 3 decimals).

### Power Down

Sites can request a Power Down:

```
hive_keychain.requestPowerDown(username,  amount, function(response) {
    console.log(response);
});
```

Where `amount` is expressed in SP for more visibility for the user.

## Related Projects

* [ngx-steem-keychain](https://github.com/steeveproject/ngx-steem-keychain) -
  Native [Angular](https://angular.io) framework integration.

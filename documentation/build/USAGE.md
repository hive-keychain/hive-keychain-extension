## Example

An example of a web page that interacts with the extension is included in the "example" folder in the repo. You can test it by running a local HTTP server and going to http://localhost:1337/main.html in your browser.

`cd example`
`python -m http.server 1337 //or any other method to run a static server`

NOTE: On localhost, it will run on port 1337.

## Using Keychain for logins

To login, you can encode a message from your backend and verify that the user can decode it using the `requestVerifyKey` method.
See an example in this project by @howo (@steempress witness):

[Frontend](https://github.com/drov0/downvote-control-tools-front/blob/c453b81d482421e5ae006c25502c491dbebdc180/src/components/Login.js#L34)

[Backend](https://github.com/drov0/downvote-control-tool-back/blob/master/routes/auth.js#L159)

Alternatively, you can use `requestSignTx` and verify the signature on your backend.

## @hiveio/keychain

This [npm module](https://www.npmjs.com/package/@hiveio/keychain) makes it easy to add Keychain support within the browser. It also includes helpful functions to check whether Keychain was used before. It was developed by @therealwolf (witness).

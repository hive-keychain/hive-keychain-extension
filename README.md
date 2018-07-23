# steem-wallet
A wallet browser extension for the Steem blockchain and cryptocurrency

# Features

The Steem Wallet extensions includes the following features:
- Store an unlimited number of accounted and their private keys, encrypted with AES.
- Wallet locks automatically on browser shutdown or manually

## From extension popup:
- Direct transfer to user (if active key is set)
- Current wallet values
- Transactions history
- Memo decoding (if memo key is set)

## Accepts requests from websites
Steem Wallet will always ask for your confirmation before broadcasting the transaction.
Websites can ask Steem Wallet the following:
- Send a handshake to make sure the extension is installed.
- Decode a message encrypted by a private key
- Write a post / comment
- Broadcast a vote
- Broadcast a custom JSON
- Send a transfer

# Example

To get a working example of how websites can interact with the extension:

`cd example`
`python -m http.server 8000 //or any other method to run a static server`

Open the example at the port specified on localhost (here 8000).

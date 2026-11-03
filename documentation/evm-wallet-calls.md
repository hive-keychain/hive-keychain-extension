# Sequential wallet calls

Keychain implements the four [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) wallet methods for version `2.0.0`:

- `wallet_getCapabilities`: connected software accounts advertise `atomic.status: "unsupported"` on configured EVM chains. Ledger accounts and locked wallets do not advertise batching. Unconnected addresses receive `4100`.
- `wallet_sendCalls`: one approval for 1–10 ordered calls, followed by separate signed transactions with consecutive nonces. The response is `{ id }`; it does not wait for mining.
- `wallet_getCallsStatus`: an origin-scoped persisted status and ordered receipts, including reverted transactions.
- `wallet_showCallsStatus`: opens the batch status in the approval dialog; closing it resolves the request with no result payload.

## Limits

This implementation does not provide atomicity, paymasters, account upgrades, or Ledger batching. `atomicRequired: true` fails with `5760`. Unsupported required capabilities fail with `5700`; explicitly optional capabilities are ignored.

Every call must pass gas estimation against current state. There is no fallback gas limit or simulation of intermediate state. For example, an approval followed by a transfer that needs that approval may fail preflight. Fees are capped at the reviewed amounts, and confirmation checks balance, permissions, and gas requirements again. Each call reuses the standard transaction confirmation fields and editable gas fee panel. One warning review can acknowledge warnings from all calls, and one approval covers the complete batch. The single balance panel combines native value and gas costs across the batch, plus decoded ERC-20 transfers when available. Edited fee limits are validated again and used when signing.

Transactions can revert independently, and later calls may still execute. A definitive submission failure stops the unsent suffix. RPC timeouts remain pending and retry the same signed bytes. Known fee replacements are followed; cancellations are counted as failures. If an external transaction consumes a nonce and its outcome cannot be identified, the batch remains pending rather than claiming an unsupported outcome.

The background journal coordinates nonce reservations with ordinary popup and dapp sends. It stores signed transactions before broadcasting, resumes after worker restarts, and keeps completed records for at least 24 hours from submission. Pending records remain available. The journal is runtime data and is not included in settings exports or backups. IDs are unique per origin during retention, including across accounts, to keep status lookup unambiguous.

## Manual test on a disposable test account

Use an EIP-1193 Keychain provider selected through EIP-6963. Add a test network and fund a disposable software account with test currency before running these commands. The calls below spend gas.

```js
const [from] = await provider.request({ method: 'eth_requestAccounts' });
const chainId = await provider.request({ method: 'eth_chainId' });
await provider.request({ method: 'wallet_getCapabilities', params: [from, [chainId]] });

const { id } = await provider.request({
  method: 'wallet_sendCalls',
  params: [{
    version: '2.0.0', from, chainId, atomicRequired: false,
    calls: [
      { to: from, value: '0x0' },
      { to: from, value: '0x0' },
    ],
  }],
});
await provider.request({ method: 'wallet_getCallsStatus', params: [id] });
await provider.request({ method: 'wallet_showCallsStatus', params: [id] });
```

Check two separate receipts and consecutive nonces. Repeat with rejection (no transaction), `atomicRequired: true` (`5760`), an unknown ID (`5730`), and the same ID from another origin (`5730`). Switch the selected chain after submission: status must still refer to the original chain. Interrupt the worker after a signed batch is persisted and verify recovery keeps the original transaction hashes. Test a pending batch alongside a normal transfer and a fee replacement.

Automated tests cover request validation, account/chain capabilities, approval binding, fee checks, signing failure, nonce coordination, ordered recovery, receipt aggregation, origin isolation, replacement tracking, internal-message authorization, repeated confirmation, and dialog warning/expiry gating. Browser and testnet execution still require the manual checks above.

//TODO to delete after refactoring
const selectKeys = {
  import: {
    postingkey: 'checkbox-import-posting-key',
    activeKey: 'checkbox-import-active-key',
    memoKey: 'checkbox-import-memo-key',
  },
};

const transfer = {
  recurrent: 'checkbox-transfer-recurrent',
  cancelRecurrent: 'checkbox-cancel-recurrent',
};

const tokensFilter = {
  selectToken: {
    preFix: 'checkbox-select-token-',
  },
};

const autoLock = {
  preFix: 'checkbox-auto-lock-',
};

const keychainify = {
  checkbox: 'checkbox-keychainify',
};

const rpcNodes = {
  select: {
    automaticMode: 'checkbox-rpc-nodes-automatic-mode',
    addTesnetNode: 'checkbox-add-rpc-test-node',
    setAsActive: 'checkbox-set-new-rpc-as-active',
  },
};

const automatedTasks = {
  checkbox: {
    claim: {
      rewards: 'checkbox-autoclaim-rewards',
      accounts: 'checkbox-autoclaim-accounts',
      savings: 'checkbox-autoclaim-savings',
    },
  },
};

export default {
  selectKeys,
  transfer,
  tokensFilter,
  autoLock,
  keychainify,
  rpcNodes,
  automatedTasks,
};

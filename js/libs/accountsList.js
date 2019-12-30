class AccountsList {
  constructor() {
    this.accounts = {};
  }
  init(accounts, last_account) {
    if (accounts) {
      this.accounts = accounts;
      // Add the last account selected to the front of the account list.
      if (last_account) {
        let last = this.accounts.list.find(a => a.name == last_account);
        if (last) {
          this.accounts.list.splice(this.accounts.list.indexOf(last), 1);
          this.accounts.list.unshift(last);
        }
      }
    }
  }
  getList() {
    return this.accounts.list || [];
  }
  getAccountsArray() {
    return this.getList().map(e => new Account(e));
  }
  get(name) {
    return new Account(this.accounts.list.find(e => e.name === name));
  }
  save(mk) {
    chrome.storage.local.set({
      accounts: encryptJson(this.accounts, mk)
    });
  }
  clear() {
    chrome.storage.local.clear();
  }
  isEmpty() {
    return !this.accounts.list || !this.accounts.list.length;
  }
  add(account) {
    if (!this.accounts.list) this.accounts.list = [];
    this.accounts.list.push(account);
    return this;
  }
}

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
      this.accounts.list = this.accounts.list.map(e => new Account(e));
    }
  }
  getList() {
    return this.accounts.list || [];
  }
  get(name) {
    return this.accounts.list.find(e => e.getName() === name);
  }
  getById(id) {
    return this.accounts.list[id];
  }
  save(mk) {
    const accounts = {
      ...this.accounts,
      list: this.accounts.list.map(e => e.getObj())
    };
    console.log(accounts);
    chrome.storage.local.set({
      accounts: encryptJson(accounts, mk)
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
  delete(i) {
    this.accounts.list.splice(i, 1);
    return this;
  }
}

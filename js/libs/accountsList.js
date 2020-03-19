class AccountsList {
  constructor() {
    this.accounts = {list: []};
  }
  init(accounts, last_account) {
    if (accounts) {
      this.accounts = accounts;
      this.accounts.list = this.accounts.list.map(e => new Account(e));

      // Sort the accounts by name
      this.accounts.list.sort((a, b) =>
        a.getName() < b.getName() ? -1 : a.getName() > b.getName() ? 1 : 0
      );

      // Add the last account selected to the front of the account list.
      if (last_account) {
        console.log(this.accounts.list, last_account);
        let last = this.accounts.list.find(a => a.account.name == last_account);
        console.log(last);
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
  get(name) {
    return this.getList().find(e => e.getName() === name);
  }
  getById(id) {
    return this.accounts.list[id];
  }
  save(mk) {
    chrome.storage.local.set({
      accounts: this.encrypt(mk)
    });
  }
  clear() {
    chrome.storage.local.clear();
    this.accounts = {};
  }
  isEmpty() {
    return !this.accounts.list || !this.accounts.list.length;
  }
  import(accounts, mk) {
    console.log(this.accounts.list);
    for (const account of accounts) {
      if (!this.accounts.list.find(acc => acc.getName() === account.name))
        this.accounts.list.push(new Account(account));
    }
    this.save(mk);
  }
  encrypt(mk) {
    const accounts = {
      ...this.accounts,
      list: this.accounts.list.map(e => e.getObj())
    };
    return encryptJson(accounts, mk);
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

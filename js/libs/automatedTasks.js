class AutomatedTasks {
  constructor() {
    //chrome.storage.local.remove(["claimRewards", "claimAccounts"]);
  }

  init({ claimRewards, claimAccounts }) {
    this.claimRewards = claimRewards ? claimRewards : {};
    this.claimAccounts = claimAccounts ? claimAccounts : {};
  }

  getTask(task) {
    return this[task] || {};
  }

  getTaskByUser(task, user) {
    return this.getTask(task)[user];
  }

  hasForUser(task, user) {
    return !!this.getTaskByUser(task, user);
  }
  setTaskForUser(task, user, obj) {
    this[task][user] = obj;
    const newobj = {};
    newobj[task] = this[task];
    chrome.storage.local.set(newobj);
  }
  removeTaskForUser(task, user) {
    delete this[task][user];
    const newobj = {};
    newobj[task] = this[task];
    chrome.storage.local.set(newobj);
  }
}

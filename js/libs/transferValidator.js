class TransferValidator {
  constructor() {
    this.phishingAccounts = getPhishingAccounts();
  }
  async isPhishing(account) {
    return (await this.phishingAccounts).includes(account);
  }
  getExchangeValidationWarning(account, currency, hasMemo) {
    const exchanges = [
      {account: "bittrex", tokens: ["HIVE", "HBD"]},
      {account: "deepcrypto8", tokens: ["HIVE"]},
      {account: "binance-hot", tokens: []},
      {account: "ionomy", tokens: ["HIVE", "HBD"]},
      {account: "huobi-pro", tokens: ["HIVE"]},
      {account: "huobi-withdrawal", tokens: []},
      {account: "blocktrades", tokens: ["HIVE", "HBD"]},
      {account: "mxchive", tokens: ["HIVE"]},
      {account: "hot.dunamu", tokens: []},
      {account: "probithive", tokens: ["HIVE"]},
      {account: "probitred", tokens: []},
      {account: "upbitsteem", tokens: []}
    ];

    const exchange = exchanges.find(exchange => exchange.account === account);
    console.log(exchange);
    if (!exchange) return null;
    else if (!exchange.tokens.includes(currency)) {
      return chrome.i18n.getMessage("popup_warning_exchange_deposit", [
        currency
      ]);
    } else if (!hasMemo) {
      return chrome.i18n.getMessage("popup_warning_exchange_memo");
    } else return null;
  }

  async validate(account, currency, hasMemo) {
    console.log(account, currency, hasMemo);
    let warning = null;
    if (await this.isPhishing(account)) {
      console.log("is phishing");
      warning = chrome.i18n.getMessage("popup_warning_phishing");
    } else {
      warning = this.getExchangeValidationWarning(account, currency, hasMemo);
    }
    if (warning) {
      $("#transfer_warning").text(warning);
      $("#confirm_send_div p").hide();
    } else {
      $("#transfer_warning").text("");
      $("#confirm_send_div p").show();
    }
  }
}

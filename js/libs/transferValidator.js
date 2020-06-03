class TransferValidator {
  constructor() {
    this.phishingAccounts = getPhishingAccounts();
  }
  async isPhishing(account) {
    return (await this.phishingAccounts).includes(account);
  }
  async validate(account) {
    let warning = null;
    if (await this.isPhishing(account)) {
      console.log("is phishing");
      warning = chrome.i18n.getMessage("popup_warning_phishing");
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

class GlobalProps {
  constructor() {
    this.props = steem.api.getDynamicGlobalPropertiesAsync();
    this.median = steem.api.getCurrentMedianHistoryPriceAsync();
    this.fund = steem.api.getRewardFundAsync("post");
    this.prices = this.initGetPrice();
  }
  async getProp(key) {
    return (await this.props)[key];
  }
  async getMedian() {
    return await this.median;
  }
  async getFund(key) {
    return (await this.fund)[key];
  }
  async getHivePrice() {
    const median = await this.getMedian();
    return (
      parseFloat(median.base.replace(" SBD", "")) /
      parseFloat(median.quote.replace(" STEEM", ""))
    );
  }
  async initGetPrice() {
    return await getPricesAsync();
  }
  async getPrices() {
    let {hive, hbd, btc} = await this.prices;
    hive = hive.result["Bid"];
    hbd = hbd.result["Bid"];
    btc = btc.result["Bid"];
    return [hive * btc, hbd * btc];
  }
}

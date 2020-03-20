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
    return await Promise.all([
      await getPriceHiveAsync(),
      await getPriceHBDAsync(),
      await getBTCPriceAsync()
    ]);
  }
  async getPrices() {
    const [steem, sbd, btc] = await this.prices;
    return [steem * btc, sbd * btc];
  }
}

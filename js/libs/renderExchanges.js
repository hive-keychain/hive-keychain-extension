const exchanges = [
  {
    name: "bittrex",
    tokens: ["HIVE", "HBD"],
    url_hive: "https://global.bittrex.com/Market/Index?MarketName=BTC-HIVE",
    url_hbd: "https://global.bittrex.com/Market/Index?MarketName=BTC-HBD"
  },
  {
    name: "binance",
    tokens: ["HIVE"],
    url_hive: "https://www.binance.com/en/trade/HIVE_BTC"
  },
  {
    name: "ionomy",
    tokens: ["HIVE", "HBD"],
    url_hive: "https://ionomy.com/en/markets/btc-hive",
    url_hbd: "https://ionomy.com/en/markets/btc-hbd"
  },
  {
    name: "huobi",
    tokens: ["HIVE"],
    url_hive: "https://www.huobi.com/en-us/exchange/hive_usdt/"
  },
  {
    name: "mxc",
    tokens: ["HIVE"],
    url_hive: "https://www.mxc.com/trade/easy#HIVE_USDT"
  },
  {
    name: "probit",
    tokens: ["HIVE"],
    url_hive: "https://www.probit.com/app/exchange/HIVE-USDT"
  }
];

const renderExchangesList = crypto => {
  let exchangesList = exchanges.filter(e => e.tokens.includes(crypto));
  console.log(crypto, exchangesList);
  const COLS_PER_ROW = 2;
  const rows = Math.ceil(exchangesList.length / COLS_PER_ROW);
  console.log(rows);
  let html = "";
  for (let i = 0; i < rows; i++) {
    html += '<div class="row_exchange">';
    console.log(html);
    for (let j = 0; j < COLS_PER_ROW; j++) {
      if (!exchangesList[i * COLS_PER_ROW + j]) break;
      html += renderExchange(
        exchangesList[i * COLS_PER_ROW + j],
        crypto.toLowerCase()
      );
    }
    html += "</div>";
  }
  $("#buy_exchanges div").html(html);
};

const renderExchange = (exchange, crypto) => {
  return `
  <a href="${exchange[`url_${crypto}`]}" target="_blank">
  <div class="img_wrapper"><div>
  <img src="../images/${exchange.name}.png"/>
  </div></div>
  </a>
  `;
};

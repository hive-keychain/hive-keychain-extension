const exchanges = [
  {
    account: "bittrex",
    tokens: ["HIVE", "HBD"],
    url_hive: "https://global.bittrex.com/Market/Index?MarketName=BTC-HIVE",
    url_hbd: "https://global.bittrex.com/Market/Index?MarketName=BTC-HBD"
  },
  { account: "deepcrypto8", tokens: ["HIVE"], url_hive: "" },
  {
    account: "ionomy",
    tokens: ["HIVE", "HBD"],
    url_hive: "https://ionomy.com/en/markets/btc-hive",
    url_hbd: "https://ionomy.com/en/markets/btc-hbd"
  },
  { account: "huobi-pro", tokens: ["HIVE"], url_hive: "" },
  { account: "mxchive", tokens: ["HIVE"], url_hive: "" },
  { account: "probithive", tokens: ["HIVE"], url_hive: "" }
];

const renderExchangesList = crypto => {
  let exchangesList = exchanges.filter(e => e.tokens.includes(crypto));
  console.log(crypto, exchangesList);
  const COLS_PER_ROW = 3;
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
  <img src="../images/${exchange.account}.png"/>
  </div></div>
  </a>
  `;
};

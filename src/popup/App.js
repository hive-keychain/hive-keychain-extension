import React, { Component } from "react";

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>{chrome.i18n.getMessage("popup_html_new_password")}</h1>
      </div>
    );
  }
}

export default App;

window.sk_params = {
  page: 'main',
};

function parseQueryString() {
  const queryString = window.location.search;
  const queryParamString = queryString.split('?').pop();
  const queryParams = queryParamString.split('&');
  for (let qi=0; qi<queryParams.length; qi++) {
    const queryParam = queryParams[qi];
    const keyValue = queryParam.split('=');
    if (keyValue[0] && keyValue[1]) {
      window.sk_params[keyValue[0]] = keyValue[1];
    }
  }
}

parseQueryString();
initializeVisibility();
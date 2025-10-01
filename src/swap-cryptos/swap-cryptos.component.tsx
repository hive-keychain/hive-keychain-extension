import React, { useEffect, useState } from 'react';
import { QueryParams } from 'src/interfaces/query-params.interface';

export const SwapCryptosComponent = () => {
  const [urlParams, setUrlParams] = useState<QueryParams>({});

  useEffect(() => {
    const queryParamsTable = window.location.search.replace('?', '').split('&');
    const query = {} as QueryParams;
    for (let params of queryParamsTable) {
      const splitParams = params.split('=');
      query[splitParams[0]] = decodeURIComponent(splitParams[1]);
    }
    setUrlParams(query);
  }, []);

  return (
    <div>
      SwapCryptosComponent
      {/* Access URL parameters via urlParams object */}
      {/* Example: urlParams['paramName'] */}
    </div>
  );
};

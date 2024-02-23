const get = async (
  url: string,
  params?: { [p: string]: string },
): Promise<any> => {
  return await new Promise((resolve, reject) => {
    try {
      const urlWithOptions =
        url + (params ? `?${new URLSearchParams(params)}` : '');
      fetch(urlWithOptions, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (res && res.status === 200) {
            return res.json();
          }
        })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

const post = async (url: string, body: any): Promise<any> => {
  return await new Promise((resolve, reject) => {
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((res) => {
          if (res && (res.status === 200 || res.status === 201)) {
            return res.json();
          }
        })
        .then((res) => {
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

const buildUrl = (baseURL: string, url: string) => {
  return `${baseURL}/${url}`;
};

export const BaseApi = {
  get,
  post,
  buildUrl,
};

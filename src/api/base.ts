export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
}

const isSuccessStatus = (status: number) => status >= 200 && status < 300;

const parseJsonResponse = async (res: Response): Promise<unknown> => {
  if (res.status === 204) return undefined;

  try {
    return await res.json();
  } catch {
    return undefined;
  }
};

const getWithResponse = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return { status: res.status, data: await parseJsonResponse(res) };
};

const postWithResponse = async (
  url: string,
  body: unknown,
): Promise<ApiResponse> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await parseJsonResponse(res) };
};

const get = async (url: string): Promise<any> => {
  return await new Promise((resolve, reject) => {
    try {
      fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (res && isSuccessStatus(res.status)) {
            return parseJsonResponse(res);
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
          if (res && isSuccessStatus(res.status)) {
            return parseJsonResponse(res);
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

export const BaseApi = {
  get,
  post,
  getWithResponse,
  postWithResponse,
};

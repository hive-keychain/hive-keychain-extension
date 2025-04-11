export interface AUTH_REQ_DATA {
  app: {
    name: string;
    description?: string;
    icon?: string;
  };
  challenge?: string;
  toketn?: string;
}

export interface AUTH_REQ {
  cmd: 'auth_req';
  account: string;
  data: AUTH_REQ_DATA | string;
}

export interface AUTH_WAIT {
  cmd: 'auth_wait';
  uuid: string;
  expire: number;
  account: string;
}

export interface AUTH_PAYLOD {
  account: string;
  uuid: string;
  key: string;
  host: string;
}

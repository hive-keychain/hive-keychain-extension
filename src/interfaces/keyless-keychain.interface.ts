export interface KeylessAuthData {
  app_name: string;
  auth_key: string;
  uuid?: string;
  expire?: number;
}
export interface KeylessAuthDataUserDictionary {
  [username: string]: KeylessAuthData[];
}
